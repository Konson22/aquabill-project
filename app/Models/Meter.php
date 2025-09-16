<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meter extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'serial',
        'status',
        'size',
        'model',
        'manufactory',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function readings()
    {
        return $this->hasMany(MeterReading::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
