<?php

namespace App\Models;

use Database\Factories\ZoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Zone extends Model
{
    /** @use HasFactory<ZoneFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::created(function (Zone $zone): void {
            if ($zone->supplySchedules()->exists()) {
                return;
            }

            $mondayId = SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id');

            if ($mondayId === null) {
                return;
            }

            $zone->supplySchedules()->create([
                'supply_day_id' => $mondayId,
                'start_time' => '08:00:00',
                'effective_from' => now()->toDateString(),
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public static function createWithSupplySchedule(array $attributes = []): static
    {
        $supplyDayId = $attributes['supply_day_id'] ?? SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id');
        $startTime = $attributes['supply_time'] ?? '08:00:00';
        unset($attributes['supply_day_id'], $attributes['supply_time']);

        return static::withoutEvents(function () use ($attributes, $supplyDayId, $startTime): static {
            $zone = static::query()->create($attributes);

            $zone->supplySchedules()->create([
                'supply_day_id' => $supplyDayId,
                'start_time' => $startTime,
                'effective_from' => now()->toDateString(),
            ]);

            return $zone->load(['supplySchedules' => fn ($query) => $query->active()->with('supplyDay')]);
        });
    }

    protected $fillable = [
        'name',
        'description',
        'boundary_geojson',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'boundary_geojson' => 'array',
        ];
    }

    /**
     * @return HasMany<SupplySchedule, Zone>
     */
    public function supplySchedules(): HasMany
    {
        return $this->hasMany(SupplySchedule::class);
    }

    /**
     * @return HasMany<SupplyHistory, Zone>
     */
    public function supplyHistories(): HasMany
    {
        return $this->hasMany(SupplyHistory::class);
    }

    /**
     * Log an actual supply run. Use kind "reserve" on reserve weekdays to resupply any area.
     *
     * @param  array{
     *     supplied_on: string,
     *     supply_day_id?: int|null,
     *     supply_schedule_id?: int|null,
     *     start_time?: string|null,
     *     end_time?: string|null,
     *     kind?: 'scheduled'|'reserve'|'makeup',
     *     notes?: string|null,
     *     recorded_by?: int|null,
     * }  $attributes
     */
    public function recordSupplyHistory(array $attributes): SupplyHistory
    {
        $supplyDayId = $attributes['supply_day_id'] ?? null;
        $kind = $attributes['kind'] ?? 'scheduled';

        if ($supplyDayId !== null) {
            $isReserveDay = SupplyDay::query()
                ->whereKey($supplyDayId)
                ->where('is_reserve', true)
                ->exists();

            if ($isReserveDay && $kind === 'scheduled') {
                $kind = 'reserve';
            }
        }

        return $this->supplyHistories()->create([
            'supply_day_id' => $supplyDayId,
            'supply_schedule_id' => $attributes['supply_schedule_id'] ?? null,
            'supplied_on' => $attributes['supplied_on'],
            'start_time' => $attributes['start_time'] ?? null,
            'end_time' => $attributes['end_time'] ?? null,
            'kind' => $kind,
            'notes' => $attributes['notes'] ?? null,
            'recorded_by' => $attributes['recorded_by'] ?? null,
        ]);
    }

    /**
     * Get the customers for the zone.
     *
     * @return HasMany<Customer, Zone>
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * @return HasMany<Subzone, Zone>
     */
    public function subzones(): HasMany
    {
        return $this->hasMany(Subzone::class);
    }

    /**
     * Get the bills for the zone.
     */
    public function bills(): HasManyThrough
    {
        return $this->hasManyThrough(Bill::class, Customer::class);
    }

    /**
     * @return HasMany<WaterPoint, Zone>
     */
    public function waterPoints(): HasMany
    {
        return $this->hasMany(WaterPoint::class);
    }

    /**
     * @return HasMany<Pipe, Zone>
     */
    public function pipes(): HasMany
    {
        return $this->hasMany(Pipe::class);
    }

    /**
     * @return HasMany<Valve, Zone>
     */
    public function valves(): HasMany
    {
        return $this->hasMany(Valve::class);
    }

    /**
     * @return HasMany<Station, Zone>
     */
    public function stations(): HasMany
    {
        return $this->hasMany(Station::class);
    }
}
