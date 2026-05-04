<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_period_id',
        'staff_id',
        'basic_salary',
        'allowances',
        'deductions',
        'tax_amount',
        'pension_amount',
        'net_salary',
        'working_days',
        'present_days',
        'leave_days',
        'absent_days',
        'status',
    ];

    /**
     * @return BelongsTo<PayrollPeriod, Payroll>
     */
    public function payrollPeriod(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriod::class);
    }

    /**
     * @return BelongsTo<Staff, Payroll>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    /**
     * @return HasMany<PayrollAdjustment, Payroll>
     */
    public function adjustments(): HasMany
    {
        return $this->hasMany(PayrollAdjustment::class);
    }

    protected function casts(): array
    {
        return [
            'basic_salary' => 'decimal:2',
            'allowances' => 'decimal:2',
            'deductions' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'pension_amount' => 'decimal:2',
            'net_salary' => 'decimal:2',
            'present_days' => 'decimal:2',
            'leave_days' => 'decimal:2',
            'absent_days' => 'decimal:2',
        ];
    }
}
