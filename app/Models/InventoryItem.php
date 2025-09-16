<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_name',
        'category',
        'description',
        'unit',
        'quantity_available',
        'reorder_level'
    ];

    protected $casts = [
        'quantity_available' => 'integer',
        'reorder_level' => 'integer'
    ];

    // Relationships
    public function maintenanceRequests()
    {
        return $this->hasMany(MaintenanceRequest::class, 'item_id');
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }
}
