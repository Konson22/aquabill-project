<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceCharge extends Model
{
    protected $fillable = [
        'customer_id',
        'service_charge_type_id',
        'amount',
        'issued_by',
        'issued_date',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'due_date' => 'date',
        'amount' => 'decimal:2',
    ];

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
}
