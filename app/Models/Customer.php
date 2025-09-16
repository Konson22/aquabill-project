<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'plot_number',
        'address',
        'credit',
        'email',
        'contract',
        'date',
        'latitude',
        'longitude',
        'neighborhood_id',
        'category_id',
        'meter_id',
        'account_number',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'credit' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessor for full name
    public function getFullNameAttribute()
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    // Alias for name to maintain compatibility
    public function getNameAttribute()
    {
        return $this->full_name;
    }

    // Relationships
    public function neighborhood()
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function meter()
    {
        return $this->belongsTo(Meter::class, 'meter_id');
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

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function meterLogs()
    {
        return $this->hasMany(MeterLog::class);
    }
}
