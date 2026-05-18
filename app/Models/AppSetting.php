<?php

namespace App\Models;

use App\Services\BillingPeriodService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use RuntimeException;

class AppSetting extends Model
{
    protected $fillable = [
        'billing_cycle',
        'billing_cycle_day',
        'current_billing_period_start',
        'current_billing_period_end',
        'financial_year_start_month',
        'financial_year_start_day',
        'disconnection_period_days',
        'grace_period_days',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'current_billing_period_start' => 'date',
            'current_billing_period_end' => 'date',
        ];
    }

    public static function current(): self
    {
        $settings = static::query()->first();

        if ($settings === null) {
            throw new RuntimeException('App settings are not configured. Run AppSettingSeeder.');
        }

        return $settings;
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    public function billingPeriodBounds(): array
    {
        if ($this->current_billing_period_start !== null && $this->current_billing_period_end !== null) {
            return [
                $this->current_billing_period_start->copy()->startOfDay(),
                $this->current_billing_period_end->copy()->startOfDay(),
            ];
        }

        return app(BillingPeriodService::class)->resolveFor(now(), (int) $this->billing_cycle_day);
    }
}
