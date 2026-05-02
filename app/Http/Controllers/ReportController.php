<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

        $paymentsInScope = Payment::query()
            ->when($from, fn ($q) => $q->whereDate('payment_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('payment_date', '<=', $to))
            ->when(filled($search), function ($q) use ($search): void {
                $q->whereHas('customer', function ($c) use ($search): void {
                    $c->where('name', 'like', '%'.$search.'%')
                        ->orWhere('account_number', 'like', '%'.$search.'%');
                });
            });

        /*
         * Revenue is defined as billed water charges only.
         * Keep this tied to bill current_charge (excluding carried balances and service charges).
         */
        $totalRevenue = (float) (clone $billsInScope)->sum('current_charge');
        $totalPaid = (float) (clone $paymentsInScope)->sum('amount');

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

        $billOutstanding = (float) (clone $billsInScope)
            ->withSum('payments', 'amount')
            ->get()
            ->sum(fn (Bill $bill) => max(0.0, (float) $bill->total_amount - (float) ($bill->payments_sum_amount ?? 0)));

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

        $paymentsCount = (clone $paymentsInScope)->count() + $paidChargesQuery->count();

        // Rows for the table (Recent Bills)
        $rowsQuery = Bill::with(['customer', 'payments'])
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

        // Chart Data (Daily Revenue Trend)
        $chartStart = $from ? Carbon::parse($from) : now()->subDays(30);
        $chartEnd = $to ? Carbon::parse($to) : now();

        $dailyRevenue = [];
        $currentDate = $chartStart->copy();

        while ($currentDate <= $chartEnd) {
            $dateStr = $currentDate->toDateString();

            $billDaySum = Bill::query()
                ->whereDate('created_at', $dateStr)
                ->when(filled($search), function ($q) use ($search): void {
                    $q->whereHas('customer', function ($c) use ($search): void {
                        $c->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    });
                })
                ->sum('current_charge');

            $chargeDaySum = ServiceCharge::query()
                ->whereDate('issued_date', $dateStr)
                ->when(filled($search), function ($q) use ($search): void {
                    $q->whereHas('customer', function ($c) use ($search): void {
                        $c->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    });
                })
                ->sum('amount');

            $dailyRevenue[] = [
                'date' => $currentDate->format('M d'),
                'revenue' => (float) ($billDaySum + $chargeDaySum),
            ];

            $currentDate->addDay();
        }

        return Inertia::render('reports/revenue', [
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_paid' => (float) $actualTotalPaid,
                'total_outstanding' => (float) $totalOutstanding,
                'payments_count' => $paymentsCount,
            ],
            'chartData' => $dailyRevenue,
            'rows' => $bills->through(fn ($bill) => [
                'id' => $bill->id,
                'date' => $bill->created_at->toDateString(),
                'reference' => 'BILL-'.str_pad($bill->id, 6, '0', STR_PAD_LEFT),
                'customer_name' => $bill->customer?->name,
                'account_number' => $bill->customer?->account_number,
                'paid' => (float) $bill->payments->sum('amount'),
                'outstanding' => (float) ($bill->total_amount - $bill->payments->sum('amount')),
            ]),
            'filters' => [
                'search' => $search,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }

    /**
     * Display the water usage report.
     */
    public function waterUsage(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');

        $billsQuery = Bill::query();

        if ($from) {
            $billsQuery->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $billsQuery->whereDate('created_at', '<=', $to);
        }

        $totalConsumption = $billsQuery->sum('consumption');
        $avgConsumption = $billsQuery->avg('consumption') ?? 0;
        $billsCount = $billsQuery->count();

        // Consumption by Zone
        $usageByZone = Zone::withSum(['bills' => function ($q) use ($from, $to) {
            if ($from) {
                $q->whereDate('created_at', '>=', $from);
            }
            if ($to) {
                $q->whereDate('created_at', '<=', $to);
            }
        }], 'consumption')->get()->map(fn ($zone) => [
            'name' => $zone->name,
            'consumption' => (float) ($zone->bills_sum_consumption ?? 0),
        ]);

        // Daily Trend
        $chartStart = $from ? Carbon::parse($from) : now()->subDays(30);
        $chartEnd = $to ? Carbon::parse($to) : now();

        $dailyUsage = [];
        $currentDate = $chartStart->copy();

        while ($currentDate <= $chartEnd) {
            $dateStr = $currentDate->toDateString();
            $daySum = Bill::whereDate('created_at', $dateStr)->sum('consumption');

            $dailyUsage[] = [
                'date' => $currentDate->format('M d'),
                'consumption' => (float) $daySum,
            ];

            $currentDate->addDay();
        }

        // Top Consumers
        $topConsumers = Customer::withSum(['bills' => function ($q) use ($from, $to) {
            if ($from) {
                $q->whereDate('created_at', '>=', $from);
            }
            if ($to) {
                $q->whereDate('created_at', '<=', $to);
            }
        }], 'consumption')
            ->orderByDesc('bills_sum_consumption')
            ->limit(10)
            ->get()
            ->map(fn ($customer) => [
                'name' => $customer->name,
                'account' => $customer->account_number,
                'consumption' => (float) ($customer->bills_sum_consumption ?? 0),
            ]);

        return Inertia::render('reports/water-usage', [
            'summary' => [
                'total_consumption' => (float) $totalConsumption,
                'avg_consumption' => (float) $avgConsumption,
                'bills_count' => $billsCount,
            ],
            'chartData' => $dailyUsage,
            'zoneData' => $usageByZone,
            'topConsumers' => $topConsumers,
            'filters' => [
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }
}
