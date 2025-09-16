<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_id',
        'type',
        'quantity',
        'transaction_date',
        'reference',
        'handled_by'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'quantity' => 'integer'
    ];

    // Relationships
    public function item()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function handledBy()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
