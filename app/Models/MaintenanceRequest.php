<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_id',
        'vehicle_id',
        'description',
        'request_date',
        'status',
        'handled_by'
    ];

    protected $casts = [
        'request_date' => 'date'
    ];

    // Relationships
    public function item()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function handledBy()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
