<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'comment',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    /** Nom affiché publiquement : prénom + initiale du nom (« Aminata D. »). */
    public function authorName(): string
    {
        $parts = preg_split('/\s+/', trim((string) $this->user?->name)) ?: [];
        $first = $parts[0] ?? 'Client';
        $last = count($parts) > 1 ? mb_strtoupper(mb_substr(end($parts), 0, 1)).'.' : '';

        return trim("{$first} {$last}");
    }

    /** Vrai si le client a reçu (commande livrée) ce produit : condition pour laisser un avis. */
    public static function userHasReceived(User $user, int $productId): bool
    {
        return $user->orders()
            ->where('status', 'delivered')
            ->whereHas('items', fn ($q) => $q->where('product_id', $productId))
            ->exists();
    }
}
