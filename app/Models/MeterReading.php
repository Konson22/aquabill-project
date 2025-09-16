<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MeterReading extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'value',
        'previous',
        'meter_id',
        'customer_id',
        'illigal_connection',
        'source',
        'note',
        'billing_officer',
        'date'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    // Accessor for consumption
    public function getConsumptionAttribute()
    {
        return $this->value - $this->previous;
    }

    // Relationships
    public function meter()
    {
        return $this->belongsTo(Meter::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class, 'reading_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'billing_officer');
    }
}
