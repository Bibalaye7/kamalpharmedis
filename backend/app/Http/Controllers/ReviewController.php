<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/** Avis clients vérifiés : seul un client ayant reçu le produit peut le noter. */
class ReviewController extends Controller
{
    /** Avis visibles d'un produit + répartition des notes (public). */
    public function index(Request $request, Product $product): JsonResponse
    {
        $reviews = $product->reviews()
            ->visible()
            ->with('user:id,name')
            ->latest()
            ->paginate(min((int) $request->input('per_page', 10), 50));

        $reviews->getCollection()->transform(fn (ProductReview $r) => $this->present($r));

        $distribution = $product->reviews()->visible()
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        return response()->json([
            'reviews' => $reviews,
            'summary' => [
                'average' => round((float) $product->reviews()->visible()->avg('rating'), 1),
                'count' => (int) $product->reviews()->visible()->count(),
                'distribution' => collect(range(5, 1))->mapWithKeys(fn ($n) => [$n => (int) ($distribution[$n] ?? 0)]),
            ],
        ]);
    }

    /** Le client connecté peut-il noter ce produit ? Et son avis existant. */
    public function mine(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        $review = $product->reviews()->where('user_id', $user->id)->first();

        return response()->json([
            'can_review' => $user->hasRole('client') && ProductReview::userHasReceived($user, $product->id),
            'review' => $review ? $this->present($review) : null,
        ]);
    }

    /** Crée ou modifie l'avis du client (un seul par produit). */
    public function store(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $user->hasRole('client') || ! ProductReview::userHasReceived($user, $product->id)) {
            return response()->json([
                'message' => 'Seuls les clients ayant reçu ce produit peuvent laisser un avis.',
            ], 403);
        }

        $review = ProductReview::updateOrCreate(
            ['product_id' => $product->id, 'user_id' => $user->id],
            ['rating' => $data['rating'], 'comment' => $data['comment'] ?? null]
        );

        Cache::tags(['catalog'])->flush();

        return response()->json([
            'message' => 'Merci pour votre avis !',
            'review' => $this->present($review->load('user:id,name')),
        ], $review->wasRecentlyCreated ? 201 : 200);
    }

    /** Le client retire son propre avis. */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $product->reviews()->where('user_id', $request->user()->id)->delete();
        Cache::tags(['catalog'])->flush();

        return response()->json(['message' => 'Avis supprimé.']);
    }

    /** Données publiques d'un avis : jamais l'email ni le nom complet du client. */
    private function present(ProductReview $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'author' => $review->authorName(),
            'verified_purchase' => true,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
        ];
    }
}
