<?php

namespace App\Models;

use App\Events\BillGenerated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bill extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted()
    {
        static::created(function ($bill) {
            // Dispatch event when a new bill is created
            event(new BillGenerated($bill));
        });
    }

    protected $fillable = [
        'customer_id',
        'meter_id',
        'reading_id',
        'billing_period_start',
        'billing_period_end',
        'prev_balance',
        'consumption',
        'unit_price',
        'fixed_charge',
        'other_charge',
        'total_amount',
        'current_balance',
        'status',
        'generated_by'
    ];

    protected $casts = [
        'billing_period_start' => 'date',
        'billing_period_end' => 'date',
        'prev_balance' => 'decimal:2',
        'consumption' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'fixed_charge' => 'decimal:2',
        'other_charge' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'current_balance' => 'decimal:2'
    ];

    // Scopes
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'unpaid');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    public function scopePartiallyPaid($query)
    {
        return $query->where('status', 'partially_paid');
    }

    public function scopeBalanceForwarded($query)
    {
        return $query->where('status', 'balance_forwarded');
    }

    public function scopeWithOutstandingBalance($query)
    {
        return $query->where('current_balance', '>', 0);
    }

    public function scopeWithBalanceForwarded($query)
    {
        return $query->where('prev_balance', '>', 0);
    }

    // Methods
    public function updateCurrentBalance()
    {
        $totalPaid = $this->payments()->sum('amount');
        $this->current_balance = max(0, $this->total_amount - $totalPaid);
        $this->save();
        
        return $this->current_balance;
    }

    public function getOutstandingAmountAttribute()
    {
        return $this->current_balance;
    }

    /**
     * Update bill status based on current balance and payments
     */
    public function updateStatus()
    {
        $totalPaid = $this->payments()->sum('amount');
        $outstandingAmount = $this->total_amount - $totalPaid;

        if ($outstandingAmount <= 0) {
            // Fully paid
            $this->status = 'paid';
            $this->current_balance = 0;
        } elseif ($totalPaid > 0) {
            // Partially paid
            $this->status = 'partially_paid';
            $this->current_balance = $outstandingAmount;
        } elseif ($this->billing_period_end < now() && $outstandingAmount > 0) {
            // Overdue
            $this->status = 'overdue';
            $this->current_balance = $outstandingAmount;
        } else {
            // Unpaid
            $this->status = 'unpaid';
            $this->current_balance = $outstandingAmount;
        }

        $this->save();
        return $this->status;
    }

    /**
     * Mark bill as having balance forwarded to next bill
     */
    public function markAsBalanceForwarded()
    {
        $this->status = 'balance_forwarded';
        $this->save();
        return $this;
    }

    /**
     * Check if bill has balance that should be forwarded
     */
    public function hasBalanceToForward()
    {
        return $this->current_balance > 0 && $this->status !== 'paid';
    }

    /**
     * Get the amount that will be forwarded to next bill
     */
    public function getBalanceToForward()
    {
        if ($this->status === 'paid') {
            return 0;
        }
        return $this->current_balance;
    }

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function meter()
    {
        return $this->belongsTo(Meter::class);
    }

    public function reading()
    {
        return $this->belongsTo(MeterReading::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }



    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
