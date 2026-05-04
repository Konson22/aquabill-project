<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollAdjustment extends Model
{
    protected $fillable = [
        'payroll_id',
        'type',
        'amount',
        'title',
        'description',
    ];

    /**
     * @return BelongsTo<Payroll, PayrollAdjustment>
     */
    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }
}
