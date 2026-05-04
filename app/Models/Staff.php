<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use SoftDeletes;

    protected $table = 'staff';

    protected $fillable = [
        'hr_department_id',
        'employee_number',
        'name',
        'phone',
        'email',
        'job_title',
        'status',
        'hired_on',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'notes',
    ];

    /**
     * @return BelongsTo<HrDepartment, Staff>
     */
    public function hrDepartment(): BelongsTo
    {
        return $this->belongsTo(HrDepartment::class);
    }

    /**
     * @return HasMany<StaffAttendance, Staff>
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(StaffAttendance::class);
    }

    /**
     * @return HasMany<StaffLeaveRequest, Staff>
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(StaffLeaveRequest::class);
    }

    /**
     * @return HasMany<StaffLeaveBalance, Staff>
     */
    public function leaveBalances(): HasMany
    {
        return $this->hasMany(StaffLeaveBalance::class);
    }

    /**
     * @return HasMany<StaffSalary, Staff>
     */
    public function salaries(): HasMany
    {
        return $this->hasMany(StaffSalary::class);
    }

    /**
     * @return HasMany<Payroll, Staff>
     */
    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    /**
     * @return HasMany<StaffDocument, Staff>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(StaffDocument::class);
    }

    /**
     * @return HasMany<TrainingParticipant, Staff>
     */
    public function trainingParticipants(): HasMany
    {
        return $this->hasMany(TrainingParticipant::class);
    }

    /**
     * @return BelongsToMany<TrainingProgram, Staff>
     */
    public function trainingPrograms(): BelongsToMany
    {
        return $this->belongsToMany(TrainingProgram::class, 'training_participants')
            ->withPivot(['id', 'status', 'score', 'certificate_path', 'remarks', 'created_at', 'updated_at'])
            ->withTimestamps();
    }

    protected function casts(): array
    {
        return [
            'hired_on' => 'date',
        ];
    }
}
