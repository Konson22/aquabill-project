<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MeterLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'old_meter_id',
        'new_meter_id',
        'action_type',
        'reason',
        'effective_date',
        'installation_date',
        'performed_by',
        'old_meter_data',
        'new_meter_data',
        'notes'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'installation_date' => 'date',
        'old_meter_data' => 'array',
        'new_meter_data' => 'array'
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function oldMeter()
    {
        return $this->belongsTo(Meter::class, 'old_meter_id');
    }

    public function newMeter()
    {
        return $this->belongsTo(Meter::class, 'new_meter_id');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
