<?php

namespace App\Models;

use Database\Factories\SupplyHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplyHistory extends Model
{
    /** @use HasFactory<SupplyHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'supply_day_id',
        'supply_schedule_id',
        'supplied_on',
        'start_time',
        'end_time',
        'kind',
        'notes',
        'recorded_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'supplied_on' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Zone, SupplyHistory>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return BelongsTo<SupplyDay, SupplyHistory>
     */
    public function supplyDay(): BelongsTo
    {
        return $this->belongsTo(SupplyDay::class);
    }

    /**
     * @return BelongsTo<SupplySchedule, SupplyHistory>
     */
    public function supplySchedule(): BelongsTo
    {
        return $this->belongsTo(SupplySchedule::class);
    }

    /**
     * @return BelongsTo<User, SupplyHistory>
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
