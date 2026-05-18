<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\DB;

class ServiceCharge extends Model
{
    /**
     * @var list<string>
     */
    protected $appends = [
        'total_due',
    ];

    protected $fillable = [
        'customer_id',
        'service_charge_type_id',
        'amount',
        'other_charges',
        'issued_by',
        'issued_date',
        'due_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_date' => 'date',
            'due_date' => 'date',
            'amount' => 'decimal:2',
            'other_charges' => 'decimal:2',
        ];
    }

    public static function totalDueSumExpression(): string
    {
        return 'amount + COALESCE(other_charges, 0)';
    }

    /**
     * @param  Builder<ServiceCharge>  $query
     */
    public static function sumTotalDue(Builder $query): float
    {
        return (float) (clone $query)->sum(DB::raw(self::totalDueSumExpression()));
    }

    public function totalDueFloat(): float
    {
        return round((float) $this->amount + (float) ($this->other_charges ?? 0), 2);
    }

    /**
     * @return Attribute<string, never>
     */
    protected function totalDue(): Attribute
    {
        return Attribute::make(
            get: fn (): string => number_format($this->totalDueFloat(), 2, '.', ''),
        );
    }

    /**
     * Get the customer associated with this service charge.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the type of service charge.
     */
    public function serviceChargeType(): BelongsTo
    {
        return $this->belongsTo(ServiceChargeType::class);
    }

    /**
     * Get the user who issued this service charge.
     */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Payments recorded when this charge is settled.
     *
     * @return MorphMany<Payment, ServiceCharge>
     */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
