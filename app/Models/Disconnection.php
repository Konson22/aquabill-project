<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disconnection extends Model
{
    protected $fillable = [
        'customer_id',
        'notified_at',
        'notice_ends_at',
        'grace_period_ends_at',
        'disconnected_at',
        'reconnected_at',
        'status',
        'disconnection_type',
        'reason',
        'notes',
        'disconnected_by',
        'reconnected_by',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
            'notice_ends_at' => 'datetime',
            'grace_period_ends_at' => 'datetime',
            'disconnected_at' => 'datetime',
            'reconnected_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function disconnectedBy()
    {
        return $this->belongsTo(User::class, 'disconnected_by');
    }

    public function reconnectedBy()
    {
        return $this->belongsTo(User::class, 'reconnected_by');
    }
}
