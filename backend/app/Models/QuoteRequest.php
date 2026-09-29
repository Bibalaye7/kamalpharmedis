<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class QuoteRequest extends Model
{
    public const STATUSES = ['new', 'in_progress', 'sent', 'accepted', 'rejected'];
    public const COMPANY_TYPES = ['clinique', 'pharmacie', 'hopital', 'cabinet', 'laboratoire', 'ong', 'autre'];

    protected $fillable = [
        'reference',
        'user_id',
        'company_name',
        'company_type',
        'ninea',
        'contact_name',
        'email',
        'phone',
        'city',
        'needed_by',
        'message',
        'status',
        'quoted_total',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'needed_by' => 'date:Y-m-d',
            'quoted_total' => 'integer',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteRequestItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function generateReference(): string
    {
        do {
            $reference = 'DEV-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
        } while (static::where('reference', $reference)->exists());

        return $reference;
    }
}
