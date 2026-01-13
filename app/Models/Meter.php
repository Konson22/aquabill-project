<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meter extends Model
{
    use HasFactory;

    protected $fillable = [
        'home_id',
        'meter_number',
        'meter_type',
        'installation_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'installation_date' => 'date',
        ];
    }

    public function home()
    {
        return $this->belongsTo(Home::class);
    }

    public function readings()
    {
        return $this->hasMany(MeterReading::class);
    }
}
