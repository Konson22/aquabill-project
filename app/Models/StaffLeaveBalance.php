<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffLeaveBalance extends Model
{
    protected $fillable = [
        'staff_id',
        'leave_type_id',
        'year',
        'entitled_days',
        'used_days',
        'remaining_days',
    ];

    /**
     * @return BelongsTo<Staff, StaffLeaveBalance>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * @return BelongsTo<LeaveType, StaffLeaveBalance>
     */
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    protected function casts(): array
    {
        return [
            'entitled_days' => 'decimal:2',
            'used_days' => 'decimal:2',
            'remaining_days' => 'decimal:2',
        ];
    }
}
