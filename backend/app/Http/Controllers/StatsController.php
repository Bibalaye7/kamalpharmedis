<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Chiffres réels affichés sur le site (accueil, À propos) : ils évoluent seuls avec le
     * catalogue et les inscriptions. CLIENTS_BASE ajoute les clients déjà servis hors du site
     * (boutique, téléphone) : à renseigner uniquement avec un nombre réel.
     */
    public function public(): JsonResponse
    {
        $stats = Cache::remember('public-stats', 600, function () {
            $reviews = ProductReview::visible()->whereHas('product', fn ($q) => $q->active());

            return [
                'products' => Product::active()->count(),
                'categories' => Category::whereHas('products', fn ($q) => $q->active())->count(),
                'clients' => (int) config('services.clients_base')
                    + User::where('is_active', true)->whereHas('role', fn ($q) => $q->where('name', Role::CLIENT))->count(),
                'reviews' => [
                    'count' => (clone $reviews)->count(),
                    'average' => round((float) (clone $reviews)->avg('rating'), 1),
                ],
                // Derniers vrais avis (4 ou 5 étoiles, avec commentaire) pour la section « Ce que disent nos clients »
                'testimonials' => (clone $reviews)->with(['user:id,name', 'product:id,name,slug'])
                    ->where('rating', '>=', 4)
                    ->whereNotNull('comment')->where('comment', '!=', '')
                    ->latest()->limit(4)->get()
                    ->map(fn (ProductReview $r) => [
                        'author' => $r->authorName(),
                        'rating' => $r->rating,
                        'comment' => $r->comment,
                        'product' => ['name' => $r->product?->name, 'slug' => $r->product?->slug],
                    ])->values(),
            ];
        });

        return response()->json($stats);
    }
}
