<?php

namespace App\Services;

use Carbon\Carbon;

class BillingPeriodService
{
    /**
     * Monthly period that closes on billing_cycle_day (period is previous close + 1 through close).
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    public function resolveFor(Carbon $reference, int $billingCycleDay): array
    {
        $closeThisMonth = $reference->copy()->day(min($billingCycleDay, $reference->daysInMonth));

        if ($reference->lte($closeThisMonth)) {
            $periodEnd = $closeThisMonth;
            $previousClose = $periodEnd->copy()->subMonth()->day(
                min($billingCycleDay, $periodEnd->copy()->subMonth()->daysInMonth),
            );
            $periodStart = $previousClose->copy()->addDay();
        } else {
            $periodStart = $closeThisMonth->copy()->addDay();
            $nextClose = $periodStart->copy()->addMonth()->day(
                min($billingCycleDay, $periodStart->copy()->addMonth()->daysInMonth),
            );
            $periodEnd = $nextClose;
        }

        return [$periodStart->startOfDay(), $periodEnd->startOfDay()];
    }
}
