<?php

namespace App\Models;

use Database\Factories\ZoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Zone extends Model
{
    /** @use HasFactory<ZoneFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'supply_day_id',
        'supply_time',
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
     * @return BelongsTo<SupplyDay, Zone>
     */
    public function supplyDay(): BelongsTo
    {
        return $this->belongsTo(SupplyDay::class);
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
