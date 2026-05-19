<?php

namespace App\Http\Controllers;

use App\Exports\PaymentsReportExport;
use App\Exports\RevenueSummaryExport;
use App\Exports\WaterUsageReportExport;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Tariff;
use App\Models\Zone;
use App\Services\FinanceReportService;
use App\Services\PaymentsReportService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function __construct(
        private FinanceReportService $financeReportService,
        private PaymentsReportService $paymentsReportService,
    ) {}

    /**
     * Display the revenue report.
     */
    public function revenue(Request $request)
    {
        $search = $request->input('search');
        $from = $request->input('from');
        $to = $request->input('to');

        $billsInScope = Bill::query()
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        $chargesInScope = ServiceCharge::query()
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        /*
         * Water revenue (summary.total_revenue): sum of bill current_charge (consumption × unit price; usage only).
         * Fixed charge revenue: sum of fixed_charge snapshots (tariff fixed fees on bills).
         * Total billed revenue: water + fixed on bills + service charges issued in scope (excludes previous_balance / arrears).
         */
        $totalRevenue = (float) (clone $billsInScope)->sum('current_charge');
        $fixedChargeRevenue = (float) (clone $billsInScope)->sum('fixed_charge');
        $serviceChargesRevenue = ServiceCharge::sumTotalDue($chargesInScope);
        $totalBilledRevenue = $totalRevenue + $fixedChargeRevenue + $serviceChargesRevenue;
        $totalPaid = (float) Payment::query()
            ->where('payable_type', Bill::class)
            ->whereIn('payable_id', $billsInScope->clone()->select('id'))
            ->sum('amount');

        $paidChargesQuery = ServiceCharge::where('status', 'paid')
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        $paidChargesSum = ServiceCharge::sumTotalDue($paidChargesQuery);

        $actualTotalPaid = $totalPaid + $paidChargesSum;

        $billsWithPayments = (clone $billsInScope)->withSum('payments', 'amount')->get();

        $billOutstanding = (float) $billsWithPayments
            ->sum(fn (Bill $bill): float => max(0.0, (float) $bill->total_amount - (float) ($bill->payments_sum_amount ?? 0)));

        $billRevenueBreakdown = $this->billRevenuePaidUnpaidBreakdown(
            $billsWithPayments,
            $totalRevenue,
            $fixedChargeRevenue,
        );

        $chargeOutstanding = ServiceCharge::sumTotalDue(
            ServiceCharge::query()
                ->where('status', 'unpaid')
                ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
                ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
                ->when(filled($search), function ($q) use ($search): void {
                    $q->whereHas('customer', function ($c) use ($search): void {
                        $c->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    });
                }),
        );

        $totalOutstanding = $billOutstanding + $chargeOutstanding;

        $paymentsCount = (clone $billsInScope)->whereHas('payments')->count() + $paidChargesQuery->count();

        // Rows for the table (Recent Bills)
        $rowsQuery = Bill::with(['customer'])
            ->withSum('payments', 'amount')
            ->latest();

        if ($search) {
            $rowsQuery->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        if ($from) {
            $rowsQuery->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $rowsQuery->whereDate('created_at', '<=', $to);
        }

        $bills = $rowsQuery->paginate(15)->withQueryString();

        /*
         * Chart: 12 months for chart year (Jan–Dec), clipped to the bill-date filter.
         * Each point is collection rate % for that month: (bill amount_paid in month + paid service charges issued in month)
         * ÷ (bill current_charge + fixed_charge for bills created in month), matching summary.collection_rate_percent logic per window.
         */
        $chartRangeStart = $from ? Carbon::parse($from)->startOfDay() : now()->subMonths(11)->startOfMonth()->startOfDay();
        $chartRangeEnd = $to ? Carbon::parse($to)->endOfDay() : now()->endOfDay();

        $chartYear = (int) ($from
            ? Carbon::parse($from)->year
            : ($to ? Carbon::parse($to)->year : now()->year));

        $chartData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthStart = Carbon::createFromDate($chartYear, $month, 1)->startOfDay();
            $monthEnd = Carbon::createFromDate($chartYear, $month, 1)->endOfMonth()->endOfDay();

            $clipStart = $monthStart->gt($chartRangeStart) ? $monthStart : $chartRangeStart->copy();
            $clipEnd = $monthEnd->lt($chartRangeEnd) ? $monthEnd : $chartRangeEnd->copy();

            if ($clipStart->gt($clipEnd)) {
                $monthCollectionRatePercent = 0.0;
            } else {
                $billsCreatedInClip = Bill::query()
                    ->whereDate('created_at', '>=', $clipStart->toDateString())
                    ->whereDate('created_at', '<=', $clipEnd->toDateString())
                    ->when(filled($search), function ($q) use ($search): void {
                        $q->whereHas('customer', function ($c) use ($search): void {
                            $c->where('name', 'like', '%'.$search.'%')
                                ->orWhere('account_number', 'like', '%'.$search.'%');
                        });
                    });

                $monthBilled = (float) (clone $billsCreatedInClip)->sum(DB::raw('current_charge + COALESCE(fixed_charge, 0)'));
                $billAmountPaid = (float) Payment::query()
                    ->where('payable_type', Bill::class)
                    ->whereIn('payable_id', $billsCreatedInClip->clone()->select('id'))
                    ->sum('amount');

                $paidChargesInMonth = ServiceCharge::sumTotalDue(
                    ServiceCharge::query()
                        ->where('status', 'paid')
                        ->whereDate('issued_date', '>=', $clipStart->toDateString())
                        ->whereDate('issued_date', '<=', $clipEnd->toDateString())
                        ->when(filled($search), function ($q) use ($search): void {
                            $q->whereHas('customer', function ($c) use ($search): void {
                                $c->where('name', 'like', '%'.$search.'%')
                                    ->orWhere('account_number', 'like', '%'.$search.'%');
                            });
                        }),
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

        $collectionRatePercent = $totalBilledRevenue > 0.00001
            ? round(($actualTotalPaid / $totalBilledRevenue) * 100, 1)
            : 0.0;

        $totalBillsGenerated = (int) (clone $billsInScope)->count();
        $billsPaidCount = (int) (clone $billsInScope)->where('status', 'paid')->count();
        $billsPendingCount = (int) (clone $billsInScope)->whereIn('status', ['pending', 'partial'])->count();
        $billsForwardedCount = (int) (clone $billsInScope)->where('status', 'forwarded')->count();

        $finance = $this->financeReportService->buildForRevenuePage($request);

        $revenueMonthlyBreakdown = $this->revenueMonthlyBreakdown($chartYear, $search);

        return Inertia::render('revenue-report/index', [
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_revenue_paid' => $billRevenueBreakdown['water_paid'],
                'total_revenue_unpaid' => $billRevenueBreakdown['water_unpaid'],
                'fixed_charge_revenue' => (float) $fixedChargeRevenue,
                'fixed_charge_paid' => $billRevenueBreakdown['fixed_paid'],
                'fixed_charge_unpaid' => $billRevenueBreakdown['fixed_unpaid'],
                'service_charges_revenue' => (float) $serviceChargesRevenue,
                'service_charges_paid' => (float) $paidChargesSum,
                'service_charges_unpaid' => (float) $chargeOutstanding,
                'total_billed_revenue' => (float) $totalBilledRevenue,
                'total_paid' => (float) $actualTotalPaid,
                'total_outstanding' => (float) $totalOutstanding,
                'collection_rate_percent' => (float) $collectionRatePercent,
                'payments_count' => $paymentsCount,
                'total_bills_generated' => $totalBillsGenerated,
                'bills_paid_count' => $billsPaidCount,
                'bills_pending_count' => $billsPendingCount,
                'bills_forwarded_count' => $billsForwardedCount,
            ],
            'chartData' => $chartData,
            'rows' => $bills->through(fn ($bill) => [
                'id' => $bill->id,
                'date' => $bill->created_at->toDateString(),
                'reference' => 'BILL-'.str_pad($bill->id, 6, '0', STR_PAD_LEFT),
                'customer_name' => $bill->customer?->name,
                'account_number' => $bill->customer?->account_number,
                'paid' => (float) $bill->amount_paid,
                'outstanding' => (float) $bill->current_balance,
            ]),
            'filters' => [
                'search' => $search,
                'from' => $from,
                'to' => $to,
            ],
            'monthlyBreakdown' => $revenueMonthlyBreakdown,
            'monthlyBreakdownYear' => $chartYear,
            ...$finance,
        ]);
    }

    /**
     * Export revenue report to Excel.
     */
    public function exportRevenue(Request $request)
    {
        $search = $request->input('search');
        $from = $request->input('from');
        $to = $request->input('to');

        // This is a simplified version of the logic in revenue()
        // In a real app, you'd extract this to a service class
        $billsInScope = Bill::query()
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        $chargesInScope = ServiceCharge::query()
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        $totalRevenue = (float) (clone $billsInScope)->sum('current_charge');
        $fixedChargeRevenue = (float) (clone $billsInScope)->sum('fixed_charge');
        $serviceChargesRevenue = ServiceCharge::sumTotalDue($chargesInScope);
        $totalBilledRevenue = $totalRevenue + $fixedChargeRevenue + $serviceChargesRevenue;
        $totalPaid = (float) Payment::query()
            ->where('payable_type', Bill::class)
            ->whereIn('payable_id', $billsInScope->clone()->select('id'))
            ->sum('amount');

        $paidChargesSum = ServiceCharge::sumTotalDue(
            ServiceCharge::where('status', 'paid')
                ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
                ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
                ->when(filled($search), function ($q) use ($search): void {
                    $q->whereHas('customer', function ($c) use ($search): void {
                        $c->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    });
                }),
        );

        $actualTotalPaid = $totalPaid + $paidChargesSum;

        $billsWithPayments = (clone $billsInScope)->withSum('payments', 'amount')->get();

        $billOutstanding = (float) $billsWithPayments
            ->sum(fn (Bill $bill): float => max(0.0, (float) $bill->total_amount - (float) ($bill->payments_sum_amount ?? 0)));

        $billRevenueBreakdown = $this->billRevenuePaidUnpaidBreakdown(
            $billsWithPayments,
            $totalRevenue,
            $fixedChargeRevenue,
        );

        $chargeOutstanding = ServiceCharge::sumTotalDue(
            ServiceCharge::query()
                ->where('status', 'unpaid')
                ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
                ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
                ->when(filled($search), function ($q) use ($search): void {
                    $q->whereHas('customer', function ($c) use ($search): void {
                        $c->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    });
                }),
        );

        $totalOutstanding = $billOutstanding + $chargeOutstanding;

        $collectionRatePercent = $totalBilledRevenue > 0.00001
            ? round(($actualTotalPaid / $totalBilledRevenue) * 100, 1)
            : 0.0;

        $summary = [
            'total_revenue' => $totalRevenue,
            'total_revenue_paid' => $billRevenueBreakdown['water_paid'],
            'total_revenue_unpaid' => $billRevenueBreakdown['water_unpaid'],
            'fixed_charge_revenue' => $fixedChargeRevenue,
            'fixed_charge_paid' => $billRevenueBreakdown['fixed_paid'],
            'fixed_charge_unpaid' => $billRevenueBreakdown['fixed_unpaid'],
            'service_charges_revenue' => $serviceChargesRevenue,
            'service_charges_paid' => $paidChargesSum,
            'service_charges_unpaid' => $chargeOutstanding,
            'total_billed_revenue' => $totalBilledRevenue,
            'total_paid' => $actualTotalPaid,
            'total_outstanding' => $totalOutstanding,
            'collection_rate_percent' => $collectionRatePercent,
        ];

        $bills = (clone $billsInScope)
            ->with(['customer'])
            ->withSum('payments', 'amount')
            ->latest()
            ->get()
            ->map(fn ($bill) => [
                $bill->created_at->toDateString(),
                'BILL-'.str_pad($bill->id, 6, '0', STR_PAD_LEFT),
                $bill->customer?->name,
                $bill->customer?->account_number,
                (float) $bill->amount_paid,
                (float) $bill->current_balance,
            ])
            ->toArray();

        $filters = [
            'search' => $search,
            'from' => $from,
            'to' => $to,
        ];

        $chartYear = (int) ($from
            ? Carbon::parse($from)->year
            : ($to ? Carbon::parse($to)->year : now()->year));

        $monthlyBreakdown = $this->revenueMonthlyBreakdown($chartYear, $search);

        $filename = 'revenue_report_'.now()->format('Y-m-d_His').'.xlsx';

        return Excel::download(
            new RevenueSummaryExport($summary, $filters, $bills, $monthlyBreakdown, $chartYear),
            $filename,
        );
    }

    /**
     * Display the water usage report.
     */
    public function waterUsage(Request $request)
    {
        $report = $this->buildWaterUsageReportData($request);

        return Inertia::render('water-report/index', [
            ...$report,
            'filterOptions' => [
                'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
                'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    public function exportWaterUsage(Request $request)
    {
        $report = $this->buildWaterUsageReportData($request);
        $filename = 'water_usage_report_'.now()->format('Y-m-d_His').'.xlsx';

        return Excel::download(
            new WaterUsageReportExport(
                $report['summary'],
                $report['filters'],
                $report['chartData'],
                $report['chartMeta'],
                $report['zoneData'],
                $report['monthlyBreakdown'],
                $report['topConsumers'],
            ),
            $filename,
        );
    }

    /**
     * @return array{
     *     summary: array{total_consumption: float, avg_consumption: float, bills_count: int},
     *     chartData: list<array{date: string, consumption: float}>,
     *     chartMeta: array{granularity: string},
     *     zoneData: list<array{name: string, consumption: float}>,
     *     monthlyBreakdown: list<array{month: string, label: string, consumption: float, bills_count: int}>,
     *     topConsumers: list<array{id: int, name: string, account: string, consumption: float}>,
     *     filters: array{month: string, zone_id: int|null, tariff_id: int|null, from: string, to: string},
     * }
     */
    private function buildWaterUsageReportData(Request $request): array
    {
        $filterContext = $this->resolveWaterUsageFilters($request);
        $fromStr = $filterContext['from'];
        $toStr = $filterContext['to'];
        $start = $filterContext['start'];
        $end = $filterContext['end'];
        $zoneId = $filterContext['zone_id'];
        $tariffId = $filterContext['tariff_id'];

        $billsInPeriod = $this->waterUsageBillsInPeriodQuery($fromStr, $toStr, $zoneId, $tariffId);

        $totalConsumption = (float) (clone $billsInPeriod)->sum('bills.consumption');
        $billsCount = (clone $billsInPeriod)->count('bills.id');
        $avgConsumption = $billsCount > 0 ? $totalConsumption / $billsCount : 0.0;

        /*
         * Aggregate by zone via customers → bills (avoid withSum on hasManyThrough, which can break on SQLite / some drivers).
         */
        $usageByZone = Zone::query()
            ->select('zones.id', 'zones.name')
            ->selectRaw('COALESCE(SUM(bills.consumption), 0) as zone_consumption')
            ->leftJoin('customers', 'customers.zone_id', '=', 'zones.id')
            ->leftJoin('bills', 'bills.customer_id', '=', 'customers.id')
            ->leftJoin('meter_readings', function ($join) use ($fromStr, $toStr, $zoneId, $tariffId): void {
                $join->on('meter_readings.id', '=', 'bills.reading_id')
                    ->whereDate('meter_readings.reading_date', '>=', $fromStr)
                    ->whereDate('meter_readings.reading_date', '<=', $toStr);

                if ($zoneId !== null) {
                    $join->where('customers.zone_id', $zoneId);
                }

                if ($tariffId !== null) {
                    $join->where('customers.tariff_id', $tariffId);
                }
            })
            ->groupBy('zones.id', 'zones.name')
            ->orderByDesc('zone_consumption')
            ->get()
            ->map(fn (Zone $zone): array => [
                'name' => $zone->name,
                'consumption' => (float) ($zone->zone_consumption ?? 0),
            ])
            ->values()
            ->all();

        $allMonths = $filterContext['month'] === 'all';
        $daysInRange = $start->diffInDays($end) + 1;
        $chartGranularity = $allMonths || $daysInRange > 45 ? 'month' : 'day';
        $chartData = $chartGranularity === 'month'
            ? $this->waterUsageChartByMonth($fromStr, $toStr, $start, $end, $zoneId, $tariffId)
            : $this->waterUsageChartByDay($fromStr, $toStr, $start, $end, $zoneId, $tariffId);

        $breakdownStart = $allMonths
            ? $start->copy()->startOfMonth()
            : $start->copy()->subMonth()->startOfMonth();
        $monthlyBreakdown = $this->waterUsageMonthlyBreakdown(
            $breakdownStart->toDateString(),
            $toStr,
            $breakdownStart,
            $end,
            $zoneId,
            $tariffId,
        );

        $topConsumers = Customer::query()
            ->select('customers.id', 'customers.name', 'customers.account_number')
            ->join('bills', 'bills.customer_id', '=', 'customers.id')
            ->join('meter_readings', 'meter_readings.id', '=', 'bills.reading_id')
            ->whereDate('meter_readings.reading_date', '>=', $fromStr)
            ->whereDate('meter_readings.reading_date', '<=', $toStr)
            ->when($zoneId !== null, fn ($query) => $query->where('customers.zone_id', $zoneId))
            ->when($tariffId !== null, fn ($query) => $query->where('customers.tariff_id', $tariffId))
            ->groupBy('customers.id', 'customers.name', 'customers.account_number')
            ->selectRaw('SUM(bills.consumption) as period_consumption')
            ->orderByDesc('period_consumption')
            ->limit(10)
            ->get()
            ->map(fn (Customer $customer): array => [
                'id' => $customer->id,
                'name' => $customer->name,
                'account' => $customer->account_number,
                'consumption' => (float) ($customer->period_consumption ?? 0),
            ])
            ->values()
            ->all();

        return [
            'summary' => [
                'total_consumption' => $totalConsumption,
                'avg_consumption' => round($avgConsumption, 2),
                'bills_count' => $billsCount,
            ],
            'chartData' => $chartData,
            'chartMeta' => [
                'granularity' => $chartGranularity,
            ],
            'zoneData' => $usageByZone,
            'monthlyBreakdown' => $monthlyBreakdown,
            'topConsumers' => $topConsumers,
            'filters' => [
                'month' => $filterContext['month'],
                'zone_id' => $zoneId,
                'tariff_id' => $tariffId,
                'from' => $fromStr,
                'to' => $toStr,
            ],
        ];
    }

    /**
     * Paginated list of bill and service-charge payments with filters.
     */
    public function paymentsReport(Request $request)
    {
        return Inertia::render('payments-report/index', $this->paymentsReportService->build($request));
    }

    public function exportPaymentsReport(Request $request)
    {
        $payload = $this->paymentsReportService->dataForExport($request);
        $filename = 'payments_report_'.now()->format('Ymd_His').'.xlsx';

        return Excel::download(
            new PaymentsReportExport($payload['rows'], $payload['filters'], $payload['summary']),
            $filename
        );
    }

    /**
     * @return array{
     *     month: string,
     *     zone_id: int|null,
     *     tariff_id: int|null,
     *     start: Carbon,
     *     end: Carbon,
     *     from: string,
     *     to: string,
     * }
     */
    private function resolveWaterUsageFilters(Request $request): array
    {
        $monthInput = $request->string('month')->toString();
        $allMonths = $monthInput === '' || $monthInput === 'all';

        if ($allMonths) {
            $start = now()->startOfYear()->startOfDay();
            $end = now()->endOfYear()->endOfDay();
            $month = 'all';
        } else {
            $month = preg_match('/^\d{4}-\d{2}$/', $monthInput)
                ? $monthInput
                : now()->format('Y-m');
            $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->startOfDay();
            $end = $start->copy()->endOfMonth()->endOfDay();
        }

        $zoneId = $request->integer('zone_id') ?: null;
        if ($zoneId !== null && ! Zone::query()->whereKey($zoneId)->exists()) {
            $zoneId = null;
        }

        $tariffId = $request->integer('tariff_id') ?: null;
        if ($tariffId !== null && ! Tariff::query()->whereKey($tariffId)->exists()) {
            $tariffId = null;
        }

        return [
            'month' => $month,
            'zone_id' => $zoneId,
            'tariff_id' => $tariffId,
            'start' => $start,
            'end' => $end,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
        ];
    }

    /**
     * @return Builder<Bill>
     */
    private function waterUsageBillsInPeriodQuery(
        string $fromStr,
        string $toStr,
        ?int $zoneId = null,
        ?int $tariffId = null,
    ) {
        return Bill::query()
            ->join('meter_readings', 'meter_readings.id', '=', 'bills.reading_id')
            ->join('customers', 'customers.id', '=', 'bills.customer_id')
            ->whereDate('meter_readings.reading_date', '>=', $fromStr)
            ->whereDate('meter_readings.reading_date', '<=', $toStr)
            ->when($zoneId !== null, fn ($query) => $query->where('customers.zone_id', $zoneId))
            ->when($tariffId !== null, fn ($query) => $query->where('customers.tariff_id', $tariffId));
    }

    /**
     * @return list<array{date: string, consumption: float}>
     */
    private function waterUsageChartByDay(
        string $fromStr,
        string $toStr,
        Carbon $start,
        Carbon $end,
        ?int $zoneId = null,
        ?int $tariffId = null,
    ): array {
        $dayExpr = $this->readingDateDayExpression();
        $totals = $this->waterUsageBillsInPeriodQuery($fromStr, $toStr, $zoneId, $tariffId)
            ->selectRaw("{$dayExpr} as period, SUM(bills.consumption) as total")
            ->groupByRaw($dayExpr)
            ->pluck('total', 'period');

        $series = [];
        for ($cursor = $start->copy()->startOfDay(); $cursor->lte($end); $cursor->addDay()) {
            $key = $cursor->toDateString();
            $series[] = [
                'date' => $cursor->format('M j'),
                'consumption' => (float) ($totals[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @return list<array{date: string, consumption: float}>
     */
    private function waterUsageChartByMonth(
        string $fromStr,
        string $toStr,
        Carbon $start,
        Carbon $end,
        ?int $zoneId = null,
        ?int $tariffId = null,
    ): array {
        $monthExpr = $this->readingDateMonthExpression();
        $totals = $this->waterUsageBillsInPeriodQuery($fromStr, $toStr, $zoneId, $tariffId)
            ->selectRaw("{$monthExpr} as period, SUM(bills.consumption) as total")
            ->groupByRaw($monthExpr)
            ->pluck('total', 'period');

        $series = [];
        for ($cursor = $start->copy()->startOfMonth(); $cursor->lte($end); $cursor->addMonth()) {
            $key = $cursor->format('Y-m');
            $series[] = [
                'date' => $cursor->format('M Y'),
                'consumption' => (float) ($totals[$key] ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @return list<array{
     *     month: string,
     *     label: string,
     *     amount_expected: float,
     *     payments_amount: float,
     *     bills_count: int
     * }>
     */
    private function revenueMonthlyBreakdown(int $year, ?string $search): array
    {
        $billMonthExpr = $this->billCreatedMonthExpression();
        $paymentMonthExpr = $this->paymentDateMonthExpression();

        $billsRows = Bill::query()
            ->whereYear('created_at', $year)
            ->when(filled($search), function (Builder $q) use ($search): void {
                $q->whereHas('customer', function (Builder $c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            })
            ->selectRaw("{$billMonthExpr} as period")
            ->selectRaw('COUNT(bills.id) as bills_count')
            ->selectRaw('SUM(bills.total_amount) as bills_amount_expected')
            ->groupByRaw($billMonthExpr)
            ->get()
            ->keyBy('period');

        $paymentsRows = Payment::query()
            ->whereYear('payment_date', $year)
            ->when(filled($search), function (Builder $q) use ($search): void {
                $q->where(function (Builder $q) use ($search): void {
                    $q->whereHasMorph('payable', [Bill::class], function (Builder $bq) use ($search): void {
                        $bq->whereHas('customer', function (Builder $c) use ($search): void {
                            $c->where('name', 'like', '%'.$search.'%')
                                ->orWhere('account_number', 'like', '%'.$search.'%');
                        });
                    })->orWhereHasMorph('payable', [ServiceCharge::class], function (Builder $sq) use ($search): void {
                        $sq->whereHas('customer', function (Builder $c) use ($search): void {
                            $c->where('name', 'like', '%'.$search.'%')
                                ->orWhere('account_number', 'like', '%'.$search.'%');
                        });
                    });
                });
            })
            ->selectRaw("{$paymentMonthExpr} as period")
            ->selectRaw('SUM(payments.amount) as payments_amount')
            ->groupByRaw($paymentMonthExpr)
            ->get()
            ->keyBy('period');

        $series = [];

        for ($month = 1; $month <= 12; $month++) {
            $cursor = Carbon::createFromDate($year, $month, 1);
            $key = $cursor->format('Y-m');
            $paymentRow = $paymentsRows->get($key);
            $billRow = $billsRows->get($key);

            $series[] = [
                'month' => $key,
                'label' => $cursor->format('M Y'),
                'amount_expected' => round((float) ($billRow->bills_amount_expected ?? 0), 2),
                'payments_amount' => (float) ($paymentRow->payments_amount ?? 0),
                'bills_count' => (int) ($billRow->bills_count ?? 0),
            ];
        }

        return $series;
    }

    private function waterUsageMonthlyBreakdown(
        string $fromStr,
        string $toStr,
        Carbon $start,
        Carbon $end,
        ?int $zoneId = null,
        ?int $tariffId = null,
    ): array {
        $monthExpr = $this->readingDateMonthExpression();
        $rows = $this->waterUsageBillsInPeriodQuery($fromStr, $toStr, $zoneId, $tariffId)
            ->selectRaw("{$monthExpr} as period")
            ->selectRaw('SUM(bills.consumption) as total_consumption')
            ->selectRaw('COUNT(bills.id) as bills_count')
            ->groupByRaw($monthExpr)
            ->get()
            ->keyBy('period');

        $series = [];
        for ($cursor = $start->copy()->startOfMonth(); $cursor->lte($end); $cursor->addMonth()) {
            $key = $cursor->format('Y-m');
            $row = $rows->get($key);
            $series[] = [
                'month' => $key,
                'label' => $cursor->format('M Y'),
                'consumption' => (float) ($row->total_consumption ?? 0),
                'bills_count' => (int) ($row->bills_count ?? 0),
            ];
        }

        return $series;
    }

    /**
     * Allocate bill payments to water (current_charge) and fixed portions of this-cycle revenue.
     *
     * @param  Collection<int, Bill>  $bills
     * @return array{water_paid: float, water_unpaid: float, fixed_paid: float, fixed_unpaid: float}
     */
    private function billRevenuePaidUnpaidBreakdown(Collection $bills, float $totalRevenue, float $fixedChargeRevenue): array
    {
        $waterPaid = 0.0;
        $fixedPaid = 0.0;

        foreach ($bills as $bill) {
            $current = (float) $bill->current_charge;
            $fixed = (float) $bill->fixed_charge;
            $cycle = $current + $fixed;

            if ($cycle <= 0.00001) {
                continue;
            }

            $paidTotal = (float) ($bill->payments_sum_amount ?? 0);
            $previous = max(0.0, (float) $bill->previous_balance);
            $paidToCycle = max(0.0, min($cycle, $paidTotal - min($paidTotal, $previous)));

            $waterPaid += $paidToCycle * ($current / $cycle);
            $fixedPaid += $paidToCycle * ($fixed / $cycle);
        }

        return [
            'water_paid' => round($waterPaid, 2),
            'water_unpaid' => round(max(0.0, $totalRevenue - $waterPaid), 2),
            'fixed_paid' => round($fixedPaid, 2),
            'fixed_unpaid' => round(max(0.0, $fixedChargeRevenue - $fixedPaid), 2),
        ];
    }

    private function readingDateDayExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => '(meter_readings.reading_date::date)',
            'sqlite' => 'date(meter_readings.reading_date)',
            default => 'DATE(meter_readings.reading_date)',
        };
    }

    private function billCreatedMonthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(bills.created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', bills.created_at)",
            default => "DATE_FORMAT(bills.created_at, '%Y-%m')",
        };
    }

    private function paymentDateMonthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(payments.payment_date, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', payments.payment_date)",
            default => "DATE_FORMAT(payments.payment_date, '%Y-%m')",
        };
    }

    private function readingDateMonthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(meter_readings.reading_date, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', meter_readings.reading_date)",
            default => "DATE_FORMAT(meter_readings.reading_date, '%Y-%m')",
        };
    }
}
