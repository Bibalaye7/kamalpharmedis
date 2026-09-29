<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    public const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    public const PAYMENT_METHODS = ['cash_on_delivery', 'mobile_money', 'card', 'bank_transfer'];
    public const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

    /** Livraison offerte au-delà de ce montant (FCFA). */
    public const FREE_SHIPPING_THRESHOLD = 50000;
    public const SHIPPING_FEE = 2000;

    protected $fillable = [
        'reference',
        'user_id',
        'status',
        'payment_method',
        'payment_status',
        'subtotal',
        'shipping_fee',
        'total',
        'shipping_name',
        'shipping_phone',
        'shipping_address',
        'shipping_city',
        'notes',
        'delivered_at',
        'payment_token',
        'payment_url',
        'payment_reference',
        'payment_declared_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'integer',
            'shipping_fee' => 'integer',
            'total' => 'integer',
            'delivered_at' => 'datetime',
            'payment_declared_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Paiement en ligne (PayDunya) actif seulement si toutes ses clés sont renseignées. */
    public static function onlinePaymentEnabled(): bool
    {
        return filled(config('services.paydunya.master_key'))
            && filled(config('services.paydunya.private_key'))
            && filled(config('services.paydunya.public_key'))
            && filled(config('services.paydunya.token'));
    }

    /**
     * Moyens de paiement proposés pour une nouvelle commande :
     * à la livraison et transfert Wave / Orange Money (manuel, ou en ligne si PayDunya est configuré),
     * plus la carte bancaire uniquement avec le paiement en ligne.
     */
    public static function availablePaymentMethods(): array
    {
        return self::onlinePaymentEnabled()
            ? ['cash_on_delivery', 'mobile_money', 'card']
            : ['cash_on_delivery', 'mobile_money'];
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'KPM-'.now()->format('ymd').'-'.strtoupper(Str::random(5));
        } while (static::where('reference', $reference)->exists());

        return $reference;
    }

    public static function shippingFeeFor(int $subtotal): int
    {
        return $subtotal >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_FEE;
    }
}
