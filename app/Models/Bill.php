<?php

namespace App\Models;

use Database\Factories\BillFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    /** @use HasFactory<BillFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'meter_id',
        'reading_id',
        'consumption',
        'unit_price',
        'fixed_charge',
        'current_charge',
        'previous_balance',
        'total_amount',
        'status',
        'due_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'consumption' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'fixed_charge' => 'decimal:2',
            'current_charge' => 'decimal:2',
            'previous_balance' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the customer that owns the bill.
     *
     * @return BelongsTo<Customer, Bill>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the meter associated with the bill.
     *
     * @return BelongsTo<Meter, Bill>
     */
    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }

    /**
     * Get the reading associated with the bill.
     *
     * @return BelongsTo<MeterReading, Bill>
     */
    public function reading(): BelongsTo
    {
        return $this->belongsTo(MeterReading::class, 'reading_id');
    }

    /**
     * Payments applied to this bill.
     *
     * @return HasMany<Payment, Bill>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the service charges associated with this bill.
     *
     * @return HasMany<ServiceCharge, Bill>
     */
    public function serviceCharges(): HasMany
    {
        return $this->hasMany(ServiceCharge::class);
    }
}
