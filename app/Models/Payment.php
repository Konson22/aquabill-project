<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'bill_id',
        'invoice_id',
        'payment_date',
        'amount_paid',
        'payment_method',
        'reference_number',
        'received_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2'
    ];

    // Accessors
    public function getStatusAttribute()
    {
        // Since we don't have a status column, we'll assume all payments are completed
        // You can modify this logic based on your business requirements
        return 'completed';
    }

    public function getAmountAttribute()
    {
        // Alias for amount_paid to maintain compatibility
        return $this->amount_paid;
    }

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function bill()
    {
        return $this->belongsTo(Bill::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
