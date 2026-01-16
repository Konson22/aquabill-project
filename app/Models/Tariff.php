<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'fixed_charge',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'fixed_charge' => 'decimal:2',
        ];
    }

    public function homes()
    {
        return $this->hasMany(Home::class);
    }

    public function histories()
    {
        return $this->hasMany(TariffHistory::class);
    }
}

