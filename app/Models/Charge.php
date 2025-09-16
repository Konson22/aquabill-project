<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    use HasFactory;

    protected $fillable = [
        'charge_amount',
        'description',
        'category_id'
    ];

    protected $casts = [
        'charge_amount' => 'decimal:2'
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
