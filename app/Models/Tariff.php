<?php

namespace App\Models;

use Database\Factories\TariffFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tariff extends Model
{
    /** @use HasFactory<TariffFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'price_per_unit',
        'fixed_charge',
    ];

    /**
     * Get the attributes that should be cast.
     *
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
     * Get the customers for the tariff.
     *
     * @return HasMany<Customer, Tariff>
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get the history snapshots for the tariff.
     *
     * @return HasMany<TariffHistory, Tariff>
     */
    public function histories(): HasMany
    {
        return $this->hasMany(TariffHistory::class);
    }
}
