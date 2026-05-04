<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffSalary extends Model
{
    protected $fillable = [
        'staff_id',
        'base_salary',
        'housing_allowance',
        'transport_allowance',
        'other_allowances',
        'tax_rate',
        'pension_rate',
        'effective_from',
    ];

    /**
     * @return BelongsTo<Staff, StaffSalary>
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'housing_allowance' => 'decimal:2',
            'transport_allowance' => 'decimal:2',
            'other_allowances' => 'decimal:2',
            'tax_rate' => 'decimal:4',
            'pension_rate' => 'decimal:4',
            'effective_from' => 'date',
        ];
    }
}
