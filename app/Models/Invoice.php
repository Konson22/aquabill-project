<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_id',
        'description',
        'amount',
        'due_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * Get total amount paid from payments.
     */
    public function getAmountPaidAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    /**
     * Get balance (amount - amount_paid).
     */
    public function getBalanceAttribute(): float
    {
        return (float) $this->amount - $this->amount_paid;
    }

    /**
     * Get balance after (same as balance for compatibility).
     */
    public function getBalanceAfterAttribute(): float
    {
        return $this->balance;
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get all payments for this invoice.
     */
    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
