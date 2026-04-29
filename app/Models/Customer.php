<?php

namespace App\Models;

use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    protected $fillable = [
        'account_number',
        'customer_type',
        'name',
        'phone',
        'email',
        'national_id',
        'address',
        'zone_id',
        'tariff_id',
        'connection_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'connection_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Customer $customer) {
            if (empty($customer->account_number)) {
                $latestCustomer = static::orderBy('id', 'desc')->first();
                $nextId = $latestCustomer ? $latestCustomer->id + 1 : 1;
                $customer->account_number = 'WTR-'.str_pad((string) $nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the zone that the customer belongs to.
     *
     * @return BelongsTo<Zone, Customer>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get the tariff that the customer belongs to.
     *
     * @return BelongsTo<Tariff, Customer>
     */
    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    /**
     * Get the meters for the customer.
     *
     * @return HasMany<Meter, Customer>
     */
    public function meters(): HasMany
    {
        return $this->hasMany(Meter::class);
    }

    /**
     * Get the readings for the customer through their meters.
     */
    public function readings(): HasManyThrough
    {
        return $this->hasManyThrough(MeterReading::class, Meter::class);
    }

    /**
     * Get the bills for the customer.
     *
     * @return HasMany<Bill, Customer>
     */
    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    /**
     * Get the payments for the customer.
     *
     * @return HasMany<Payment, Customer>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the service charges for the customer.
     *
     * @return HasMany<ServiceCharge, Customer>
     */
    public function serviceCharges(): HasMany
    {
        return $this->hasMany(ServiceCharge::class);
    }

    /**
     * Get the meter history for the customer.
     *
     * @return HasMany<MeterHistory, Customer>
     */
    public function meterHistories(): HasMany
    {
        return $this->hasMany(MeterHistory::class);
    }
    /**
     * Get the disconnections for the customer.
     *
     * @return HasMany<Disconnection, Customer>
     */
    public function disconnections(): HasMany
    {
        return $this->hasMany(Disconnection::class);
    }
}
