<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'price',
        'old_price',
        'stock',
        'images',
        'is_featured',
        'is_active',
    ];

    protected $appends = ['image'];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'old_price' => 'integer',
            'stock' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'reviews_count' => 'integer',
            'reviews_avg_rating' => 'float',
        ];
    }

    /**
     * Les images sont stockées brutes (chemin du disque "public" ou URL absolue)
     * et exposées sous forme d'URLs complètes.
     */
    protected function images(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => collect(json_decode($value ?? '[]', true) ?: [])
                ->map(fn ($path) => Str::startsWith($path, ['http://', 'https://'])
                    ? $path
                    : Storage::disk('public')->url($path))
                ->values()
                ->all(),
            set: fn ($value) => json_encode(array_values($value ?? [])),
        );
    }

    public function getImageAttribute(): ?string
    {
        return $this->images[0] ?? null;
    }

    /** Chemins bruts des images (pour suppression de fichiers). */
    public function rawImages(): array
    {
        return json_decode($this->getRawOriginal('images') ?? '[]', true) ?: [];
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    /** Ajoute la note moyenne et le nombre d'avis visibles (reviews_avg_rating, reviews_count). */
    public function scopeWithRating(Builder $query): Builder
    {
        return $query
            ->withCount(['reviews as reviews_count' => fn ($q) => $q->visible()])
            ->withAvg(['reviews as reviews_avg_rating' => fn ($q) => $q->visible()], 'rating');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $words = preg_split('/\s+/', trim((string) $term), -1, PREG_SPLIT_NO_EMPTY);

        // Chaque mot doit être trouvé (nom, référence, description courte ou catégorie),
        // dans n'importe quel ordre : « bande gaze » trouve « Bande de gaze extensible ».
        foreach ($words as $word) {
            $query->where(function (Builder $q) use ($word) {
                $q->whereLoose('name', $word)
                    ->orWhereLoose('sku', $word)
                    ->orWhereLoose('short_description', $word)
                    ->orWhereHas('category', fn (Builder $c) => $c->whereLoose('name', $word));
            });
        }

        return $query;
    }

    /** Slug unique à partir du nom. */
    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'produit';
        $slug = $base;
        $i = 2;

        while (static::withTrashed()->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
