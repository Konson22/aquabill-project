<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'meter_reading_id',
        'customer_id',
        'billing_period_start',
        'billing_period_end',
        'tariff',
        'fix_charges',
        'water_consumption_volume',
        'previous_balance',
        'due_date',
        'status',
    ];

    /**
     * Accessors to include when serializing (e.g. to JSON for Inertia).
     *
     * @var array<int, string>
     */
    protected $appends = [
        'amount',
        'total_amount',
        'amount_paid',
        'current_balance',
    ];

    protected function casts(): array
    {
        return [
            'billing_period_start' => 'date',
            'billing_period_end' => 'date',
            'due_date' => 'date',
            'tariff' => 'decimal:2',
            'fix_charges' => 'decimal:2',
            'water_consumption_volume' => 'decimal:2',
            'previous_balance' => 'decimal:2',
        ];
    }

    /**
     * Get current period amount (water_consumption_volume * tariff + fix_charges).
     */
    public function getAmountAttribute(): float
    {
        return (float) $this->water_consumption_volume * (float) $this->tariff + (float) $this->fix_charges;
    }

    /**
     * Get total amount (amount + previous_balance).
     */
    public function getTotalAmountAttribute(): float
    {
        return (float) $this->amount + (float) $this->previous_balance;
    }

    /** @var float|null Cached amount paid to avoid duplicate queries when multiple accessors need it. */
    protected $amountPaidResolved;

    /**
     * Get total amount paid from payments.
     */
    public function getAmountPaidAttribute(): float
    {
        if ($this->amountPaidResolved === null) {
            $this->amountPaidResolved = (float) ($this->payments_sum_amount ?? $this->payments()->sum('amount'));
        }
        return $this->amountPaidResolved;
    }

    /**
     * Get balance (total_amount - amount_paid).
     */
    public function getBalanceAttribute(): float
    {
        return $this->total_amount - $this->amount_paid;
    }

    /**
     * Alias for balance (for frontend compatibility).
     */
    public function getCurrentBalanceAttribute(): float
    {
        return $this->balance;
    }

    /**
     * Get balance after (same as balance for compatibility).
     */
    public function getBalanceAfterAttribute(): float
    {
        return $this->balance;
    }

    /**
     * Scope: bills that are fully paid (balance <= 0).
     */
    public function scopeFullyPaid(Builder $q): Builder
    {
        return $q->whereRaw(
            '(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) <= COALESCE((SELECT SUM(amount) FROM payments WHERE payable_type = ? AND payable_id = bills.id), 0)',
            [self::class]
        );
    }

    /**
     * Scope: bills with outstanding balance (pending or partial paid).
     */
    public function scopeUnpaid(Builder $q): Builder
    {
        return $q->whereRaw(
            '(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) > COALESCE((SELECT SUM(amount) FROM payments WHERE payable_type = ? AND payable_id = bills.id), 0)',
            [self::class]
        );
    }

    public function meterReading()
    {
        return $this->belongsTo(MeterReading::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get all payments for this bill.
     */
    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    protected static function booted(): void
    {
        static::deleting(function (Bill $bill) {
            $bill->payments()->delete();
        });
    }
}
