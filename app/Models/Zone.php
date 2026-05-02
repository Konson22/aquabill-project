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

    protected $fillable = [
        'name',
        'supply_day',
        'supply_time',
        'description',
        'status',
    ];

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
}
