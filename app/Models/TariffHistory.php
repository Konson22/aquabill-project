<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TariffHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tariff_id',
        'name',
        'price',
        'fixed_charge',
        'description',
        'effective_from',
        'effective_to',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'fixed_charge' => 'decimal:2',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

