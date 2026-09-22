<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /** Catalogue public (produits actifs uniquement, mis en cache Redis). */
    public function index(Request $request): JsonResponse
    {
        $key = 'products:'.md5(json_encode($request->query()));

        $page = Cache::tags(['catalog'])->remember($key, 300, fn () => $this->query($request, false)->toArray());

        return response()->json($page);
    }

    /** Liste de gestion (actifs + inactifs) pour admin/manager. */
    public function adminIndex(Request $request): JsonResponse
    {
        return response()->json($this->query($request, true));
    }

    public function show(Request $request, string $product): JsonResponse
    {
        $staff = auth('api')->user()?->isStaff() ?? false;

        $model = Product::with('category:id,name,slug')
            ->when(! $staff, fn ($q) => $q->active())
            ->where(fn ($q) => ctype_digit($product) ? $q->where('id', $product) : $q->where('slug', $product))
            ->firstOrFail();

        $related = Product::with('category:id,name,slug')
            ->active()
            ->where('category_id', $model->category_id)
            ->where('id', '!=', $model->id)
            ->latest()
            ->take(4)
            ->get();

        return response()->json($model->toArray() + ['related' => $related]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['slug'] = Product::uniqueSlug($data['name']);
        $data['sku'] = $data['sku'] ?? 'KPM-'.strtoupper(Str::random(6));

        $product = Product::create($data);
        Cache::tags(['catalog'])->flush();

        return response()->json($product->load('category:id,name,slug'), 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate($this->rules($product));

        if (isset($data['name']) && $data['name'] !== $product->name) {
            $data['slug'] = Product::uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);
        Cache::tags(['catalog'])->flush();

        return response()->json($product->fresh('category:id,name,slug'));
    }

    /** Suppression logique : l'historique des commandes reste intact. */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        Cache::tags(['catalog'])->flush();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function addImage(Request $request, Product $product): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'max:4096']]);

        $path = $request->file('image')->store('products', 'public');
        $product->images = [...$product->rawImages(), $path];
        $product->save();
        Cache::tags(['catalog'])->flush();

        return response()->json($product->fresh('category:id,name,slug'), 201);
    }

    public function removeImage(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['index' => ['required', 'integer', 'min:0']]);

        $images = $product->rawImages();

        if (! isset($images[$data['index']])) {
            return response()->json(['message' => 'Image introuvable.'], 404);
        }

        [$removed] = array_splice($images, $data['index'], 1);

        if (! Str::startsWith($removed, ['http://', 'https://'])) {
            Storage::disk('public')->delete($removed);
        }

        $product->images = $images;
        $product->save();
        Cache::tags(['catalog'])->flush();

        return response()->json($product->fresh('category:id,name,slug'));
    }

    private function rules(?Product $product = null): array
    {
        $required = $product ? 'sometimes' : 'required';

        return [
            'category_id' => [$required, 'integer', 'exists:categories,id'],
            'name' => [$required, 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:40', Rule::unique('products', 'sku')->ignore($product?->id)],
            'short_description' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => [$required, 'integer', 'min:0'],
            'old_price' => ['nullable', 'integer', 'min:0'],
            'stock' => [$required, 'integer', 'min:0'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['string', 'max:500'],
        ];
    }

    private function query(Request $request, bool $admin)
    {
        $perPage = min(max((int) $request->input('per_page', 12), 1), 100);

        $query = Product::with('category:id,name,slug')->search($request->input('search'));

        if (! $admin) {
            $query->active();
        } elseif ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        if ($category = $request->input('category')) {
            $query->whereHas('category', fn ($q) => ctype_digit((string) $category)
                ? $q->where('id', $category)
                : $q->where('slug', $category));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }

        if ($request->boolean('low_stock')) {
            $query->where('stock', '<=', 10);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->input('max_price'));
        }

        match ($request->input('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name' => $query->orderBy('name'),
            'stock' => $query->orderBy('stock'),
            default => $query->latest('id'),
        };

        return $query->paginate($perPage)->withQueryString();
    }
}
