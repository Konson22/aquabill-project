<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\MeterReading;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Builder;

class LedgerDashboardService
{
    /**
     * @return array{
     *     stats: array<string, int>,
     *     billingCycle: array<string, int|string>
     * }
     */
    public function build(): array
    {
        $settings = AppSetting::current();
        [$periodStart, $periodEnd] = $settings->billingPeriodBounds();

        $eligibleCustomers = $this->eligibleCustomersQuery();
        $totalEligible = (clone $eligibleCustomers)->count();

        $unreadMeters = (clone $eligibleCustomers)
            ->where(function (Builder $query) use ($periodStart): void {
                $query->whereNull('last_reading_date')
                    ->orWhereDate('last_reading_date', '<', $periodStart);
            })
            ->count();

        $readingsCompleted = max(0, $totalEligible - $unreadMeters);

        $billsGenerated = Bill::query()
            ->whereHas('reading', function (Builder $query) use ($periodStart, $periodEnd): void {
                $query->whereDate('reading_date', '>=', $periodStart)
                    ->whereDate('reading_date', '<=', $periodEnd);
            })
            ->count();

        $readingsWithoutBill = MeterReading::query()
            ->where('previous_reading', '>', 0)
            ->whereDate('reading_date', '>=', $periodStart)
            ->whereDate('reading_date', '<=', $periodEnd)
            ->whereDoesntHave('bill')
            ->count();

        $activeRoutes = Zone::query()->where('status', 'active')->count();

        $progressPercent = $totalEligible > 0
            ? (int) round(($readingsCompleted / $totalEligible) * 100)
            : 0;

        return [
            'stats' => [
                'unread_meters' => $unreadMeters,
                'bills_generated' => $billsGenerated,
                'active_routes' => $activeRoutes,
                'pending_tasks' => $unreadMeters + $readingsWithoutBill,
            ],
            'billingCycle' => [
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'billing_cycle_day' => (int) $settings->billing_cycle_day,
                'progress_percent' => $progressPercent,
                'status_label' => $this->statusLabel($progressPercent),
                'readings_completed' => $readingsCompleted,
                'readings_total' => $totalEligible,
            ],
        ];
    }

    /**
     * @return Builder<Customer>
     */
    private function eligibleCustomersQuery(): Builder
    {
        return Customer::query()
            ->where('status', 'active')
            ->whereHas('meters', fn (Builder $query) => $query->where('status', 'active'));
    }

    private function statusLabel(int $progressPercent): string
    {
        if ($progressPercent >= 100) {
            return 'Ready for billing';
        }

        if ($progressPercent >= 50) {
            return 'Reading in progress';
        }

        return 'Cycle started';
    }
}
