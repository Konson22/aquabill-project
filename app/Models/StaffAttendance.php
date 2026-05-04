<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffAttendance extends Model
{
    protected $fillable = [
        'staff_id',
        'attendance_date',
        'clock_in',
        'clock_out',
        'status',
        'late_minutes',
        'worked_minutes',
        'remarks',
    ];

    /**
     * @return BelongsTo<Staff, StaffAttendance>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
        ];
    }
}
