<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplyDay extends Model
{
    protected $fillable = [
        'name',
        'sort_order',
        'is_reserve',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_reserve' => 'boolean',
        ];
    }

    /**
     * Weekdays when any zone may receive a reserve resupply.
     *
     * @param  Builder<SupplyDay>  $query
     * @return Builder<SupplyDay>
     */
    public function scopeReserve(Builder $query): Builder
    {
        return $query->where('is_reserve', true)->where('status', 'active');
    }

    /**
     * @return HasMany<SupplySchedule, SupplyDay>
     */
    public function supplySchedules(): HasMany
    {
        return $this->hasMany(SupplySchedule::class);
    }

    /**
     * @return HasMany<SupplyHistory, SupplyDay>
     */
    public function supplyHistories(): HasMany
    {
        return $this->hasMany(SupplyHistory::class);
    }
}
