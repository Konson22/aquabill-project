<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeterHistory extends Model
{
    use HasFactory;

    protected $table = 'meter_history';

    protected $fillable = [
        'home_id',
        'meter_id',
        'customer_id',
        'final_reading',
        'total_consumption',
        'assigned_at',
        'unassigned_at',
        'reason',
        'notes',
        'replaced_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
    ];

    public function home()
    {
        return $this->belongsTo(Home::class);
    }

    public function meter()
    {
        return $this->belongsTo(Meter::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function replacedBy()
    {
        return $this->belongsTo(User::class, 'replaced_by');
    }
}
