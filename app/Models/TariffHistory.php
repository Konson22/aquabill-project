<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TariffHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'unit_price',
        'fixed_charge',
        'consumption',
        'changed_by',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'fixed_charge' => 'decimal:2',
        'consumption' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

