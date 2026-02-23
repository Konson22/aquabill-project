<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'zone_id',
        'area_id',
        'tariff_id',
        'address',
        'plot_number',
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

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }

    public function meter()
    {
        return $this->hasOne(Meter::class)->latestOfMany();
    }

    public function meters()
    {
        return $this->hasMany(Meter::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function readings()
    {
        return $this->hasMany(MeterReading::class);
    }

    public function latestReading()
    {
        return $this->hasOne(MeterReading::class)->latestOfMany();
    }

    public function meterHistory()
    {
        return $this->hasMany(MeterHistory::class)->orderBy('assigned_at', 'desc');
    }
}
