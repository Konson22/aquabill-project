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
        'status',
    ];

    protected function casts(): array
    {
        return [
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
