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

        // Summary Calculations (Overall or filtered?)
        // The UI cards usually show totals for the selected period.

        $billsQuery = Bill::query();
        $chargesQuery = ServiceCharge::query();
        $paymentsQuery = Payment::query();

        if ($from) {
            $billsQuery->whereDate('created_at', '>=', $from);
            $chargesQuery->whereDate('issued_date', '>=', $from);
            $paymentsQuery->whereDate('payment_date', '>=', $from);
        }

        if ($to) {
            $billsQuery->whereDate('created_at', '<=', $to);
            $chargesQuery->whereDate('issued_date', '<=', $to);
            $paymentsQuery->whereDate('payment_date', '<=', $to);
        }

        $totalRevenue = $billsQuery->sum('total_amount') + $chargesQuery->sum('amount');
        $totalPaid = $paymentsQuery->sum('amount');

        // Count paid service charges too (since they are not in payments table yet as per previous request)
        $paidChargesSum = ServiceCharge::where('status', 'paid')
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->sum('amount');

        $actualTotalPaid = $totalPaid + $paidChargesSum;
        $totalOutstanding = $totalRevenue - $actualTotalPaid;
        $paymentsCount = $paymentsQuery->count() + ServiceCharge::where('status', 'paid')
            ->when($from, fn ($q) => $q->whereDate('issued_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('issued_date', '<=', $to))
            ->count();

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

            $billDaySum = Bill::whereDate('created_at', $dateStr)->sum('total_amount');
            $chargeDaySum = ServiceCharge::whereDate('issued_date', $dateStr)->sum('amount');

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
