<?php

namespace App\Models;

use Database\Factories\BillFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bill extends Model
{
    /** @use HasFactory<BillFactory> */
    use HasFactory;

    protected $fillable = [
        'bill_no',
        'customer_id',
        'meter_number',
        'meter_id',
        'reading_id',
        'consumption',
        'unit_price',
        'fixed_charge',
        'current_charge', // This-cycle charge; revenue report sums this (not total_amount, which may include previous_balance)
        'previous_balance',
        'total_amount',
        'amount_paid',
        'current_balance',
        'status',
        'due_date',
    ];

    protected static function booted(): void
    {
        static::creating(function (Bill $bill): void {
            if (filled($bill->bill_no)) {
                return;
            }

            $next = (int) (static::query()->max('id') ?? 0) + 1;
            $bill->bill_no = 'BILL-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
        });

        static::creating(function (Bill $bill): void {
            $paid = (float) ($bill->amount_paid ?? 0);
            $total = (float) ($bill->total_amount ?? 0);
            $bill->amount_paid = $paid;
            $bill->current_balance = max(0.0, $total - $paid);
        });

        static::updating(function (Bill $bill): void {
            $paid = (float) ($bill->amount_paid ?? 0);
            $total = (float) ($bill->total_amount ?? 0);
            $bill->current_balance = max(0.0, $total - $paid);
        });
    }

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
            'amount_paid' => 'decimal:2',
            'current_balance' => 'decimal:2',
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
}
