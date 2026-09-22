<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        if (! $term) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('sku', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%");
        });
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
