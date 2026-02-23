<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payable_type',
        'payable_id',
        'amount',
        'payable_total',
        'amount_paid',
        'balance_after',
        'payment_date',
        'payment_method',
        'reference_number',
        'received_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'amount' => 'decimal:2',
            'payable_total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'balance_after' => 'decimal:2',
        ];
    }

    /**
     * Get the parent payable model (Bill or Invoice).
     */
    public function payable()
    {
        return $this->morphTo();
    }

    /**
     * Get the user who received this payment.
     */
    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
