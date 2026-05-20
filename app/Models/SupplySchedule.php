<?php

namespace App\Models;

use Database\Factories\SupplyScheduleFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplySchedule extends Model
{
    /** @use HasFactory<SupplyScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'supply_day_id',
        'start_time',
        'end_time',
        'effective_from',
        'effective_to',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    /**
     * @param  Builder<SupplySchedule>  $query
     * @return Builder<SupplySchedule>
     */
    public function scopeActive(Builder $query, ?string $onDate = null): Builder
    {
        $date = $onDate ?? now()->toDateString();

        return $query
            ->where('effective_from', '<=', $date)
            ->where(function (Builder $query) use ($date): void {
                $query->whereNull('effective_to')
                    ->orWhere('effective_to', '>=', $date);
            });
    }

    /**
     * @return BelongsTo<Zone, SupplySchedule>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return BelongsTo<SupplyDay, SupplySchedule>
     */
    public function supplyDay(): BelongsTo
    {
        return $this->belongsTo(SupplyDay::class);
    }

    /**
     * @return HasMany<SupplyHistory, SupplySchedule>
     */
    public function supplyHistories(): HasMany
    {
        return $this->hasMany(SupplyHistory::class);
    }
}
