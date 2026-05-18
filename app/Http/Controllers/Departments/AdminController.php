<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Disconnection;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Services\FinanceReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function __construct(
        private FinanceReportService $financeReportService,
    ) {}

    public function index(): Response
    {
        $notifiedCustomers = Disconnection::query()
            ->with(['customer:id,name,account_number'])
            ->where('status', 'notified')
            ->latest('notified_at')
            ->limit(10)
            ->get()
            ->map(fn (Disconnection $row): array => [
                'id' => $row->id,
                'customer_id' => $row->customer_id,
                'customer_name' => $row->customer?->name,
                'account_number' => $row->customer?->account_number,
                'notified_at' => $row->notified_at?->toDateString(),
                'notice_ends_at' => $row->notice_ends_at?->toDateString(),
            ]);

        $disconnectedCustomers = Disconnection::query()
            ->with(['customer:id,name,account_number'])
            ->where('status', 'disconnected')
            ->latest('disconnected_at')
            ->limit(10)
            ->get()
            ->map(fn (Disconnection $row): array => [
                'id' => $row->id,
                'customer_id' => $row->customer_id,
                'customer_name' => $row->customer?->name,
                'account_number' => $row->customer?->account_number,
                'disconnected_at' => $row->disconnected_at?->toDateString(),
                'disconnection_type' => $row->disconnection_type,
            ]);

        $paidBillsCount = Bill::query()->where('status', 'paid')->count();
        $unpaidBillsCount = Bill::query()->whereIn('status', ['pending', 'partial', 'forwarded'])->count();

        $billTotals = Bill::query()
            ->selectRaw('COALESCE(SUM(current_charge + fixed_charge), 0) as total_billed')
            ->first();
        $totalBilledRevenue = (float) ($billTotals->total_billed ?? 0);
        $totalPaidOnBills = (float) Payment::query()->where('payable_type', Bill::class)->sum('amount');
        $paidServiceCharges = ServiceCharge::sumTotalDue(ServiceCharge::query()->where('status', 'paid'));
        $actualTotalPaid = $totalPaidOnBills + $paidServiceCharges;
        $collectionRatePercent = $totalBilledRevenue > 0.00001
            ? round(($actualTotalPaid / $totalBilledRevenue) * 100, 1)
            : 0.0;

        $startOfMonth = Carbon::now()->startOfMonth();
        $chartYear = (int) now()->year;
        $finance = $this->financeReportService->buildForRevenuePage(
            Request::create('/', 'GET', [
                'from' => now()->startOfYear()->toDateString(),
                'to' => now()->toDateString(),
            ]),
        );

        $settings = AppSetting::current();
        [$periodStart, $periodEnd] = $settings->billingPeriodBounds();

        return Inertia::render('admin/dashboard', [
            'billingCycle' => [
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'billing_cycle_day' => (int) $settings->billing_cycle_day,
            ],
            'disconnectionStats' => Disconnection::summaryStats(),
            'quickLinkCounts' => [
                'overdue_bills' => Bill::query()
                    ->whereIn('status', ['pending', 'partial'])
                    ->whereDate('due_date', '<', Carbon::today())
                    ->count(),
                'overdue_readings' => Customer::query()
                    ->where('status', 'active')
                    ->whereHas('meters', fn ($query) => $query->where('status', 'active'))
                    ->where(function ($query) use ($startOfMonth) {
                        $query->whereNull('last_reading_date')
                            ->orWhereDate('last_reading_date', '<', $startOfMonth);
                    })
                    ->count(),
            ],
            'notifiedCustomers' => $notifiedCustomers,
            'disconnectedCustomers' => $disconnectedCustomers,
            'revenueBillCounts' => [
                'paid' => $paidBillsCount,
                'unpaid' => $unpaidBillsCount,
                'total' => $paidBillsCount + $unpaidBillsCount,
                'collection_rate_percent' => $collectionRatePercent,
            ],
            'chartData' => $this->collectionRateChartForYear($chartYear),
            'zoneRevenueComparison' => $finance['zoneRevenueComparison'],
        ]);
    }

    /**
     * @return list<array{date: string, collection_rate_percent: float}>
     */
    private function collectionRateChartForYear(int $year): array
    {
        $chartRangeStart = Carbon::createFromDate($year, 1, 1)->startOfDay();
        $chartRangeEnd = Carbon::createFromDate($year, 12, 31)->endOfDay();
        if ($year === (int) now()->year) {
            $chartRangeEnd = now()->endOfDay();
        }

        $chartData = [];

        for ($month = 1; $month <= 12; $month++) {
            $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
            $monthEnd = Carbon::createFromDate($year, $month, 1)->endOfMonth()->endOfDay();

            $clipStart = $monthStart->gt($chartRangeStart) ? $monthStart : $chartRangeStart->copy();
            $clipEnd = $monthEnd->lt($chartRangeEnd) ? $monthEnd : $chartRangeEnd->copy();

            if ($clipStart->gt($clipEnd)) {
                $monthCollectionRatePercent = 0.0;
            } else {
                $billsCreatedInClip = Bill::query()
                    ->whereDate('created_at', '>=', $clipStart->toDateString())
                    ->whereDate('created_at', '<=', $clipEnd->toDateString());

                $monthBilled = (float) (clone $billsCreatedInClip)->sum(DB::raw('current_charge + COALESCE(fixed_charge, 0)'));
                $billAmountPaid = (float) Payment::query()
                    ->where('payable_type', Bill::class)
                    ->whereIn('payable_id', $billsCreatedInClip->clone()->select('id'))
                    ->sum('amount');

                $paidChargesInMonth = ServiceCharge::sumTotalDue(
                    ServiceCharge::query()
                        ->where('status', 'paid')
                        ->whereDate('issued_date', '>=', $clipStart->toDateString())
                        ->whereDate('issued_date', '<=', $clipEnd->toDateString()),
                );

                $monthCollected = $billAmountPaid + $paidChargesInMonth;

                $monthCollectionRatePercent = $monthBilled > 0.00001
                    ? min(100.0, round(($monthCollected / $monthBilled) * 100, 1))
                    : 0.0;
            }

            $chartData[] = [
                'date' => $monthStart->format('M Y'),
                'collection_rate_percent' => $monthCollectionRatePercent,
            ];
        }

        return $chartData;
    }
}
