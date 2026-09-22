<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Panier persistant en base, un panier par utilisateur connecté. */
class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->payload($request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $error = $this->addProduct($request, $data['product_id'], $data['quantity'] ?? 1);

        if ($error) {
            return response()->json(['message' => $error], 422);
        }

        return response()->json($this->payload($request), 201);
    }

    /** Fusionne le panier local (visiteur) dans le panier du compte à la connexion. */
    public function merge(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'max:50'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        foreach ($data['items'] as $item) {
            $this->addProduct($request, $item['product_id'], $item['quantity']);
        }

        return response()->json($this->payload($request));
    }

    public function update(Request $request, CartItem $item): JsonResponse
    {
        abort_unless($item->user_id === $request->user()->id, 404);

        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']]);

        $product = Product::active()->find($item->product_id);

        if (! $product || $product->stock < 1) {
            $item->delete();

            return response()->json(['message' => 'Ce produit n\'est plus disponible.', 'cart' => $this->payload($request)], 422);
        }

        $item->update(['quantity' => min($data['quantity'], $product->stock)]);

        return response()->json($this->payload($request));
    }

    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        abort_unless($item->user_id === $request->user()->id, 404);

        $item->delete();

        return response()->json($this->payload($request));
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->cartItems()->delete();

        return response()->json($this->payload($request));
    }

    /** Ajoute un produit en respectant le stock. Retourne un message d'erreur ou null. */
    private function addProduct(Request $request, int $productId, int $quantity): ?string
    {
        $product = Product::active()->find($productId);

        if (! $product) {
            return 'Produit introuvable.';
        }

        if ($product->stock < 1) {
            return 'Ce produit est en rupture de stock.';
        }

        $item = $request->user()->cartItems()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = min(($item->exists ? $item->quantity : 0) + $quantity, $product->stock);
        $item->save();

        return null;
    }

    private function payload(Request $request): array
    {
        $items = $request->user()->cartItems()
            ->with('product.category:id,name,slug')
            ->orderBy('id')
            ->get()
            ->filter(fn (CartItem $i) => $i->product && $i->product->is_active)
            ->values();

        $subtotal = (int) $items->sum(fn (CartItem $i) => $i->product->price * $i->quantity);
        $shipping = $items->isEmpty() ? 0 : Order::shippingFeeFor($subtotal);

        return [
            'items' => $items,
            'count' => (int) $items->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping_fee' => $shipping,
            'total' => $subtotal + $shipping,
            'free_shipping_threshold' => Order::FREE_SHIPPING_THRESHOLD,
        ];
    }
}
