<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/** Modération des avis clients (masquer / réafficher / supprimer). */
class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reviews = ProductReview::with(['product:id,name,slug', 'user:id,name,email'])
            ->when($request->filled('visibility'), fn ($q) => $q->where('is_visible', $request->input('visibility') === 'visible'))
            ->when($request->filled('rating'), fn ($q) => $q->where('rating', (int) $request->input('rating')))
            ->latest()
            ->paginate(min((int) $request->input('per_page', 15), 100));

        return response()->json($reviews);
    }

    public function update(Request $request, ProductReview $review): JsonResponse
    {
        $data = $request->validate(['is_visible' => ['required', 'boolean']]);

        $review->update($data);
        Cache::tags(['catalog'])->flush();

        return response()->json($review->fresh(['product:id,name,slug', 'user:id,name,email']));
    }

    public function destroy(ProductReview $review): JsonResponse
    {
        $review->delete();
        Cache::tags(['catalog'])->flush();

        return response()->json(['message' => 'Avis supprimé.']);
    }
}
