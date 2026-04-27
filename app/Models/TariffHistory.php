<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TariffHistory extends Model
{
    protected $fillable = [
        'tariff_id',
        'name',
        'price_per_unit',
        'fixed_charge',
        'description',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_per_unit' => 'decimal:2',
            'fixed_charge' => 'decimal:2',
        ];
    }

    /**
     * Get the tariff this history belongs to.
     *
     * @return BelongsTo<Tariff, TariffHistory>
     */
    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    /**
     * Get the user who created this history row.
     *
     * @return BelongsTo<User, TariffHistory>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
