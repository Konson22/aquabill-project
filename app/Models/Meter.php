<?php

namespace App\Models;

use Database\Factories\MeterFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Meter extends Model
{
    /** @use HasFactory<MeterFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'meter_number',
        'status',
    ];

    /**
     * Get the customer that owns the meter.
     *
     * @return BelongsTo<Customer, Meter>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the readings for the meter.
     *
     * @return HasMany<MeterReading, Meter>
     */
    public function readings(): HasMany
    {
        return $this->hasMany(MeterReading::class);
    }

    /**
     * Get the latest reading for the meter.
     *
     * @return HasOne<MeterReading, Meter>
     */
    public function lastReading(): HasOne
    {
        return $this->hasOne(MeterReading::class)->latestOfMany(['reading_date', 'id']);
    }

    /**
     * Get the bills for the meter.
     *
     * @return HasMany<Bill, Meter>
     */
    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * Get the history of this meter.
     *
     * @return HasMany<MeterHistory, Meter>
     */
    public function history(): HasMany
    {
        return $this->hasMany(MeterHistory::class);
    }
}
