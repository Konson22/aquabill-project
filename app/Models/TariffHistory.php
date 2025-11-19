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
        'min_consumption',
        'max_consumption',
        'effective_from',
        'effective_to',
        'status',
        'changed_by',
        'change_reason',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'fixed_charge' => 'decimal:2',
        'min_consumption' => 'integer',
        'max_consumption' => 'integer',
        'effective_from' => 'date',
        'effective_to' => 'date',
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

