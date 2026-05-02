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

    /**
     * @return array{notified: int, grace_period: int, disconnected: int, reconnected: int}
     */
    public static function summaryStats(): array
    {
        return [
            'notified' => static::query()->where('status', 'notified')->count(),
            'grace_period' => static::query()->where('status', 'grace_period')->count(),
            'disconnected' => static::query()->where('status', 'disconnected')->count(),
            'reconnected' => static::query()->where('status', 'reconnected')->where('updated_at', '>=', now()->startOfMonth())->count(),
        ];
    }
}
