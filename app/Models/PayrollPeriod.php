<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollPeriod extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
    ];

    /**
     * @return HasMany<Payroll, PayrollPeriod>
     */
    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
}
