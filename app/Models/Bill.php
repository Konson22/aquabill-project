<?php

namespace App\Models;

use Database\Factories\BillFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Bill extends Model
{
    /** @use HasFactory<BillFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = [
        'amount_paid',
        'current_balance',
    ];

    protected $fillable = [
        'bill_no',
        'customer_id',
        'meter_number',
        'meter_id',
        'reading_id',
        'consumption',
        'unit_price',
        'fixed_charge',
        'current_charge', // This-cycle usage charge; revenue report water stream and total billed sum this (+ fixed_charge)
        'previous_balance',
        'total_amount',
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
    }

    /**
     * Total paid toward this bill (sum of {@see Payment} rows).
     */
    public function paidTotalFloat(): float
    {
        $attrs = $this->getAttributes();
        if (array_key_exists('payments_sum_amount', $attrs) && $attrs['payments_sum_amount'] !== null) {
            return round((float) $attrs['payments_sum_amount'], 2);
        }

        if ($this->relationLoaded('payments')) {
            return round((float) $this->payments->sum('amount'), 2);
        }

        return round((float) $this->payments()->sum('amount'), 2);
    }

    /**
     * @return Attribute<string, never>
     */
    protected function amountPaid(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format($this->paidTotalFloat(), 2, '.', ''),
        );
    }

    /**
     * @return Attribute<string, never>
     */
    protected function currentBalance(): Attribute
    {
        return Attribute::make(
            get: function (): string {
                $total = (float) ($this->getAttribute('total_amount') ?? 0);

                return number_format(max(0.0, $total - $this->paidTotalFloat()), 2, '.', '');
            },
        );
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
     * Individual payment rows recorded against this bill.
     *
     * @return MorphMany<Payment, Bill>
     */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
