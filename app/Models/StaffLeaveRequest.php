<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffLeaveRequest extends Model
{
    protected $fillable = [
        'staff_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'status',
        'reason',
        'admin_comment',
        'approved_by',
        'approved_at',
    ];

    /**
     * @return BelongsTo<Staff, StaffLeaveRequest>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * @return BelongsTo<LeaveType, StaffLeaveRequest>
     */
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    /**
     * @return BelongsTo<User, StaffLeaveRequest>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_days' => 'decimal:2',
            'approved_at' => 'datetime',
        ];
    }
}
