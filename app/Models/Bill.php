<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_number',
        'meter_reading_id',
        'customer_id',
        'home_id',
        'billing_period_start',
        'billing_period_end',
        'tariff',
        'fix_charges',
        'previous_balance',
        'total_amount',
        'current_balance', // Used to store remaining balance
        'due_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'billing_period_start' => 'date',
            'billing_period_end' => 'date',
            'due_date' => 'date',
            'tariff' => 'decimal:2',
            'fix_charges' => 'decimal:2',
            'previous_balance' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'current_balance' => 'decimal:2',
        ];
    }

    public function meterReading()
    {
        return $this->belongsTo(MeterReading::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function home()
    {
        return $this->belongsTo(Home::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}

