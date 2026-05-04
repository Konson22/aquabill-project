<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
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
         * Total billed revenue: water + fixed on bills in scope (excludes previous_balance / arrears).
         */
        $totalRevenue = (float) (clone $billsInScope)->sum('current_charge');
        $fixedChargeRevenue = (float) (clone $billsInScope)->sum('fixed_charge');
        $totalBilledRevenue = $totalRevenue + $fixedChargeRevenue;
        $totalPaid = (float) (clone $billsInScope)->sum('amount_paid');

        $paidChargesQuery = ServiceCharge::where('status', 'paid')
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        $paidChargesSum = (float) $paidChargesQuery->sum('amount');

        $actualTotalPaid = $totalPaid + $paidChargesSum;

        $billOutstanding = (float) (clone $billsInScope)->sum('current_balance');

        $chargeOutstanding = (float) ServiceCharge::query()
            ->where('status', 'unpaid')
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            })
            ->sum('amount');

        $totalOutstanding = $billOutstanding + $chargeOutstanding;

        $paymentsCount = (clone $billsInScope)->where('amount_paid', '>', 0)->count() + $paidChargesQuery->count();

        // Rows for the table (Recent Bills)
        $rowsQuery = Bill::with(['customer'])
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
                $billAmountPaid = (float) (clone $billsCreatedInClip)->sum('amount_paid');

                $paidChargesInMonth = (float) ServiceCharge::query()
                    ->where('status', 'paid')
                    ->whereDate('issued_date', '>=', $clipStart->toDateString())
                    ->whereDate('issued_date', '<=', $clipEnd->toDateString())
                    ->when(filled($search), function ($q) use ($search): void {
                        $q->whereHas('customer', function ($c) use ($search): void {
                            $c->where('name', 'like', '%'.$search.'%')
                                ->orWhere('account_number', 'like', '%'.$search.'%');
                        });
                    })
                    ->sum('amount');

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

        $today = Carbon::today();
        $overdueBaseQuery = Bill::query()
            ->whereIn('status', ['pending', 'partial'])
            ->whereDate('due_date', '<', $today);

        $overdueBillsMeta = [
            'total_count' => (int) (clone $overdueBaseQuery)->count(),
            'total_outstanding' => (float) (clone $overdueBaseQuery)->sum('current_balance'),
        ];

        $overdueBills = (clone $overdueBaseQuery)
            ->with(['customer:id,name,account_number'])
            ->orderBy('due_date')
            ->limit(15)
            ->get()
            ->map(fn (Bill $bill): array => [
                'id' => $bill->id,
                'due_date' => $bill->due_date?->toDateString(),
                'reference' => 'BILL-'.str_pad((string) $bill->id, 6, '0', STR_PAD_LEFT),
                'status' => $bill->status,
                'current_balance' => (float) $bill->current_balance,
                'total_amount' => (float) $bill->total_amount,
                'customer_name' => $bill->customer?->name,
                'account_number' => $bill->customer?->account_number,
            ])
            ->values()
            ->all();

        return Inertia::render('reports/revenue', [
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'fixed_charge_revenue' => (float) $fixedChargeRevenue,
                'total_billed_revenue' => (float) $totalBilledRevenue,
                'total_paid' => (float) $actualTotalPaid,
                'total_outstanding' => (float) $totalOutstanding,
                'collection_rate_percent' => (float) $collectionRatePercent,
                'payments_count' => $paymentsCount,
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
            'overdueBills' => $overdueBills,
            'overdueBillsMeta' => $overdueBillsMeta,
        ]);
    }

    /**
     * Display the water usage report.
     */
    public function waterUsage(Request $request)
    {
        $fromInput = $request->string('from')->toString();
        $toInput = $request->string('to')->toString();

        $range = $this->resolveWaterUsageDateRange($fromInput, $toInput);
        $fromStr = $range['from'];
        $toStr = $range['to'];
        $start = $range['start'];
        $end = $range['end'];

        $billsInPeriod = Bill::query()
            ->whereDate('created_at', '>=', $fromStr)
            ->whereDate('created_at', '<=', $toStr);

        $totalConsumption = (float) (clone $billsInPeriod)->sum('consumption');
        $billsCount = (clone $billsInPeriod)->count();
        $avgConsumption = $billsCount > 0 ? $totalConsumption / $billsCount : 0.0;

        /*
         * Aggregate by zone via customers → bills (avoid withSum on hasManyThrough, which can break on SQLite / some drivers).
         */
        $usageByZone = Zone::query()
            ->select('zones.id', 'zones.name')
            ->selectRaw('COALESCE(SUM(bills.consumption), 0) as zone_consumption')
            ->leftJoin('customers', 'customers.zone_id', '=', 'zones.id')
            ->leftJoin('bills', function ($join) use ($fromStr, $toStr): void {
                $join->on('bills.customer_id', '=', 'customers.id')
                    ->whereDate('bills.created_at', '>=', $fromStr)
                    ->whereDate('bills.created_at', '<=', $toStr);
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

        $daysInRange = $start->diffInDays($end) + 1;
        $chartGranularity = $daysInRange > 45 ? 'month' : 'day';
        $chartData = $chartGranularity === 'month'
            ? $this->waterUsageChartByMonth($fromStr, $toStr, $start, $end)
            : $this->waterUsageChartByDay($fromStr, $toStr, $start, $end);

        $topConsumers = Customer::query()
            ->select('customers.id', 'customers.name', 'customers.account_number')
            ->join('bills', 'bills.customer_id', '=', 'customers.id')
            ->whereDate('bills.created_at', '>=', $fromStr)
            ->whereDate('bills.created_at', '<=', $toStr)
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

        return Inertia::render('reports/water-usage', [
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
            'topConsumers' => $topConsumers,
            'filters' => [
                'from' => $fromStr,
                'to' => $toStr,
            ],
        ]);
    }

    /**
     * @return array{start: Carbon, end: Carbon, from: string, to: string}
     */
    private function resolveWaterUsageDateRange(string $from, string $to): array
    {
        if ($from === '' && $to === '') {
            $start = now()->startOfYear()->startOfDay();
            $end = now()->endOfYear()->endOfDay();
        } elseif ($from !== '' && $to !== '') {
            $start = Carbon::parse($from)->startOfDay();
            $end = Carbon::parse($to)->endOfDay();
        } elseif ($from !== '') {
            $start = Carbon::parse($from)->startOfDay();
            $end = $start->copy()->endOfYear()->endOfDay();
        } else {
            $end = Carbon::parse($to)->endOfDay();
            $start = $end->copy()->startOfYear()->startOfDay();
        }

        if ($start->gt($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        return [
            'start' => $start,
            'end' => $end,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
        ];
    }

    /**
     * @return list<array{date: string, consumption: float}>
     */
    private function waterUsageChartByDay(string $fromStr, string $toStr, Carbon $start, Carbon $end): array
    {
        $dayExpr = $this->billCreatedDayExpression();
        $totals = Bill::query()
            ->whereDate('created_at', '>=', $fromStr)
            ->whereDate('created_at', '<=', $toStr)
            ->selectRaw("{$dayExpr} as period, SUM(consumption) as total")
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
    private function waterUsageChartByMonth(string $fromStr, string $toStr, Carbon $start, Carbon $end): array
    {
        $monthExpr = $this->billCreatedMonthExpression();
        $totals = Bill::query()
            ->whereDate('created_at', '>=', $fromStr)
            ->whereDate('created_at', '<=', $toStr)
            ->selectRaw("{$monthExpr} as period, SUM(consumption) as total")
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

    private function billCreatedDayExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => '(created_at::date)',
            'sqlite' => 'date(created_at)',
            default => 'DATE(created_at)',
        };
    }

    private function billCreatedMonthExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql' => "to_char(created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', created_at)",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
    }
}
