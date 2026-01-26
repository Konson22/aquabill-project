<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Home extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'zone_id',
        'area_id',
        'tariff_id',
        'address',
        'plot_number',
        'phone',
        'property_type',
        'contract_date',
        'meter_install_date',
        'supply_status',
        'meter_disconnect_date',
    ];

    protected function casts(): array
    {
        return [
            'contract_date' => 'date',
            'meter_install_date' => 'date',
            'meter_disconnect_date' => 'date',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function meter()
    {
        return $this->hasOne(Meter::class)->latestOfMany();
    }

    public function meters()
    {
        return $this->hasMany(Meter::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }

    public function readings()
    {
        return $this->hasMany(MeterReading::class);
    }

    public function latestReading()
    {
        return $this->hasOne(MeterReading::class)->latestOfMany();
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function meterHistory()
    {
        return $this->hasMany(MeterHistory::class)->orderBy('assigned_at', 'desc');
    }
}
