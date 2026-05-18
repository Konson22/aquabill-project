<?php

namespace Database\Seeders;

use App\Services\BillingPeriodService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppSettingSeeder extends Seeder
{
    /**
     * Singleton application settings used across billing, reporting, and disconnection workflows.
     */
    public function run(): void
    {
        $billingCycleDay = 27;
        $now = now();
        [$periodStart, $periodEnd] = app(BillingPeriodService::class)->resolveFor($now, $billingCycleDay);

        DB::table('app_settings')->updateOrInsert(
            ['id' => 1],
            [
                'billing_cycle' => 'monthly',
                'billing_cycle_day' => $billingCycleDay,
                'current_billing_period_start' => $periodStart->toDateString(),
                'current_billing_period_end' => $periodEnd->toDateString(),
                'financial_year_start_month' => 6,
                'financial_year_start_day' => 1,
                'disconnection_period_days' => 30,
                'grace_period_days' => 15,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        );
    }
}
