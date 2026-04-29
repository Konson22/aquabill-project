<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterHistory extends Model
{
    use HasFactory;

    protected $table = 'meter_history';

    protected $fillable = [
        'meter_id',
        'final_reading',
        'total_consumption',
        'assigned_at',
        'unassigned_at',
        'customer_id',
        'reason',
        'notes',
        'replaced_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
        'final_reading' => 'decimal:2',
        'total_consumption' => 'decimal:2',
    ];

    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function replacedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replaced_by');
    }
}
