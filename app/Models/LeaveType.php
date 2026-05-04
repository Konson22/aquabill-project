<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    protected $fillable = [
        'name',
        'default_days_per_year',
        'is_paid',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'default_days_per_year' => 'decimal:2',
            'is_paid' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<StaffLeaveRequest, LeaveType>
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(StaffLeaveRequest::class);
    }

    /**
     * @return HasMany<StaffLeaveBalance, LeaveType>
     */
    public function leaveBalances(): HasMany
    {
        return $this->hasMany(StaffLeaveBalance::class);
    }
}
