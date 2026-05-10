<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function index(): Response
    {
        $totalRevenueCollected = (float) Payment::query()
            ->where('payable_type', Bill::class)
            ->sum('amount')
            + (float) ServiceCharge::query()->where('status', 'paid')->sum('amount');

        $outstandingBills = (float) Bill::query()
            ->whereIn('status', ['pending', 'partial'])
            ->withSum('payments', 'amount')
            ->get()
            ->sum(fn (Bill $bill): float => max(0.0, (float) $bill->total_amount - (float) ($bill->payments_sum_amount ?? 0)));

        $overdueBills = (int) Bill::query()
            ->whereIn('status', ['pending', 'partial'])
            ->whereDate('due_date', '<', Carbon::today()->toDateString())
            ->count();

        $monthlyCollectionSummary = $this->monthlyCollectionSummary();
        $zoneRevenueComparison = $this->zoneRevenueComparison();

        return Inertia::render('finance/dashboard', [
            'summary' => [
                'total_revenue_collected' => $totalRevenueCollected,
                'outstanding_bills' => $outstandingBills,
                'overdue_bills' => $overdueBills,
            ],
            'monthlyCollectionSummary' => $monthlyCollectionSummary,
            'zoneRevenueComparison' => $zoneRevenueComparison,
        ]);
    }

    /**
     * @return list<array{month: string, collected: float}>
     */
    private function monthlyCollectionSummary(): array
    {
        $series = [];
        $start = now()->startOfMonth()->subMonths(5);
        for ($i = 0; $i < 6; $i++) {
            $monthStart = $start->copy()->addMonths($i);
            $monthEnd = $monthStart->copy()->endOfMonth();

            $collected = (float) Payment::query()
                ->where('payable_type', Bill::class)
                ->whereDate('payment_date', '>=', $monthStart->toDateString())
                ->whereDate('payment_date', '<=', $monthEnd->toDateString())
                ->sum('amount')
                + (float) ServiceCharge::query()
                    ->where('status', 'paid')
                    ->whereDate('issued_date', '>=', $monthStart->toDateString())
                    ->whereDate('issued_date', '<=', $monthEnd->toDateString())
                    ->sum('amount');

            $series[] = [
                'month' => $monthStart->format('M Y'),
                'collected' => $collected,
            ];
        }

        return $series;
    }

    /**
     * @return list<array{zone: string, collected: float}>
     */
    private function zoneRevenueComparison(): array
    {
        return Zone::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function (Zone $zone): array {
                $billCollected = (float) Payment::query()
                    ->where('payable_type', Bill::class)
                    ->whereHasMorph('payable', [Bill::class], function (Builder $billQuery) use ($zone): void {
                        $billQuery->whereHas('customer', fn (Builder $c) => $c->where('zone_id', $zone->id));
                    })
                    ->sum('amount');

                $chargeCollected = (float) ServiceCharge::query()
                    ->where('status', 'paid')
                    ->whereHas('customer', fn (Builder $q) => $q->where('zone_id', $zone->id))
                    ->sum('amount');

                return [
                    'zone' => $zone->name,
                    'collected' => $billCollected + $chargeCollected,
                ];
            })
            ->values()
            ->all();
    }
}
