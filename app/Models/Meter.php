<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meter extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'meter_number',
        'status',
    ];

    protected function casts(): array
    {
        return [
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /** Alias for customer (API/frontend use "home" for the service connection). */
    public function home()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function readings()
    {
        return $this->hasMany(MeterReading::class);
    }

    /** Latest reading for this meter (for last_reading display). */
    public function latestReading()
    {
        return $this->hasOne(MeterReading::class)->latestOfMany('reading_date');
    }
}
