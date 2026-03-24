<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->department === 'finance') {
            // 1. Core Financial KPIs
            $totalCollected = \App\Models\Payment::sum('amount');
            $collectedToday = \App\Models\Payment::whereDate('payment_date', now())->sum('amount');

            $pendingBillAmount = Bill::unpaid()->get()->sum(fn ($b) => $b->balance);
            $pendingInvoiceAmount = Invoice::where('status', 'pending')->get()->sum(fn ($i) => $i->balance);
            $totalPending = $pendingBillAmount + $pendingInvoiceAmount;

            // 2. Bills Breakdown (status is computed from balance)
            $billStats = [
                'total' => Bill::count(),
                'pending' => Bill::unpaid()->count(),
                'fully_paid' => Bill::fullyPaid()->count(),
                'partial_paid' => Bill::unpaid()->count(), // same as unpaid; no separate partial count without loading
                'forwarded' => 0,
                'balance_forwarded' => 0,
                'overdue' => Bill::unpaid()->where('due_date', '<', now())->count(),
                'amount' => $pendingBillAmount,
            ];
            $billStats['partial_paid'] = $billStats['pending']; // keep for backward compatibility

            // Billing performance = total payment amount / total bills amount
            $totalBillsAmount = (float) Bill::selectRaw('SUM(water_consumption_volume * tariff + fix_charges + COALESCE(previous_balance, 0)) as total')->value('total');
            $totalPaymentsAmount = (float) Payment::where('payable_type', Bill::class)->sum('amount');
            $billingPerformance = $totalBillsAmount > 0
                ? ($totalPaymentsAmount / $totalBillsAmount) * 100
                : 0;

            // 3. Invoices Breakdown
            $invoiceStats = [
                'total' => Invoice::count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'unpaid' => Invoice::where('status', 'pending')->count(),
                'overdue' => Invoice::where('status', 'pending')->where('due_date', '<', now())->count(),
                'amount' => $pendingInvoiceAmount,
            ];

            // 4. Revenue Trend (January to December)
            $revenueTrend = [];
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            foreach ($months as $index => $monthName) {
                $sum = Payment::where('payable_type', Bill::class)
                    ->whereMonth('payment_date', $index + 1)
                    ->whereYear('payment_date', now()->year)
                    ->sum('amount');
                $revenueTrend[] = [
                    'name' => $monthName,
                    'total' => round($sum, 2),
                ];
            }

            // 5. Overdue Bills (Older than 30 days)
            $overdueBills = Bill::unpaid()
                ->where('due_date', '<', now()->subDays(30))
                ->with('customer')
                ->latest('due_date')
                ->take(6)
                ->get()
                ->map(function ($bill) {
                    return [
                        'id' => $bill->id,
                        'customer' => $bill->customer ? $bill->customer->name : 'N/A',
                        'amount' => $bill->balance,
                        'due_date' => $bill->due_date->format('M d, Y'),
                        'days_overdue' => now()->diffInDays($bill->due_date),
                    ];
                });

            return Inertia::render('finance/dashboard/index', [
                'stats' => [
                    'totalCollected' => $totalCollected,
                    'collectedToday' => $collectedToday,
                    'totalPending' => $totalPending,
                    'billStats' => $billStats, // Now includes detailed breakdown
                    'invoiceStats' => $invoiceStats,
                    'billingPerformance' => round($billingPerformance, 1),
                ],
                'revenueTrend' => $revenueTrend,
                'overdueBills' => $overdueBills,
            ]);
        } elseif ($user->department === 'meters') {
            return Inertia::render('meters-readers/dashboard/index');
        }

        // Admin Dashboard Data

        // Admin Dashboard Data

        // 1. Total Revenue
        $totalRevenue = \App\Models\Payment::sum('amount');
        $revenueLastMonth = \App\Models\Payment::whereMonth('payment_date', now()->subMonth()->month)
            ->whereYear('payment_date', now()->subMonth()->year)
            ->sum('amount');
        $revenueThisMonth = \App\Models\Payment::whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');

        $revenueTrend = 0;
        if ($revenueLastMonth > 0) {
            $revenueTrend = (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100;
        }

        // 2. Meters Stats (single query)
        $metersCounts = Meter::selectRaw("
            COUNT(*) as total,
            SUM(status = 'active') as active,
            SUM(status = 'inactive') as inactive,
            SUM(status = 'maintenance') as maintenance,
            SUM(status IN ('disconnected', 'disconnect')) as disconnected,
            SUM(status = 'damage') as damage
        ")->first();
        $metersStats = [
            'total' => (int) ($metersCounts->total ?? 0),
            'active' => (int) ($metersCounts->active ?? 0),
            'inactive' => (int) ($metersCounts->inactive ?? 0),
            'maintenance' => (int) ($metersCounts->maintenance ?? 0),
            'disconnected' => (int) ($metersCounts->disconnected ?? 0),
            'damage' => (int) ($metersCounts->damage ?? 0),
        ];

        $metersMonthCounts = Meter::selectRaw('
            SUM(created_at < ?) as last_month,
            SUM(MONTH(created_at) = ? AND YEAR(created_at) = ?) as this_month
        ', [now()->startOfMonth(), now()->month, now()->year])->first();
        $metersLastMonth = (int) ($metersMonthCounts->last_month ?? 0);
        $newMetersThisMonth = (int) ($metersMonthCounts->this_month ?? 0);
        $metersTrend = $metersLastMonth > 0 ? ($newMetersThisMonth / $metersLastMonth) * 100 : 0;

        // 3. Water Usage by Tariff & Zone (2 queries instead of N)
        $year = now()->year;
        $usageByTariff = MeterReading::join('customers', 'meter_readings.customer_id', '=', 'customers.id')
            ->whereYear('meter_readings.reading_date', $year)
            ->select('customers.tariff_id')
            ->selectRaw('SUM(meter_readings.current_reading - meter_readings.previous_reading) as total')
            ->groupBy('customers.tariff_id')
            ->pluck('total', 'tariff_id');

        $usageByZoneRaw = MeterReading::join('customers', 'meter_readings.customer_id', '=', 'customers.id')
            ->whereYear('meter_readings.reading_date', $year)
            ->select('customers.zone_id')
            ->selectRaw('SUM(meter_readings.current_reading - meter_readings.previous_reading) as total')
            ->groupBy('customers.zone_id')
            ->pluck('total', 'zone_id');

        $tariffs = Tariff::all();
        $colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
        $usageByCategory = $tariffs->map(function ($tariff, $index) use ($usageByTariff, $colors) {
            return [
                'name' => $tariff->name,
                'value' => round((float) ($usageByTariff[$tariff->id] ?? 0), 2),
                'fill' => $colors[$index % count($colors)],
            ];
        });

        $zones = Zone::all();
        $usageByZone = $zones->map(function ($zone, $index) use ($usageByZoneRaw, $colors) {
            return [
                'name' => $zone->name,
                'value' => round((float) ($usageByZoneRaw[$zone->id] ?? 0), 2),
                'fill' => $colors[$index % count($colors)],
            ];
        });

        // 4. Customers (connections) Stats (single query)
        $customersCounts = Customer::selectRaw("
            COUNT(*) as total,
            SUM(supply_status = 'active') as active,
            SUM(supply_status = 'suspended') as suspended,
            SUM(supply_status = 'disconnect') as disconnected
        ")->first();
        $homesStats = [
            'total' => (int) ($customersCounts->total ?? 0),
            'active' => (int) ($customersCounts->active ?? 0),
            'suspended' => (int) ($customersCounts->suspended ?? 0),
            'disconnected' => (int) ($customersCounts->disconnected ?? 0),
        ];

        $homesMonthCounts = Customer::selectRaw('
            SUM(created_at < ?) as last_month,
            SUM(MONTH(created_at) = ? AND YEAR(created_at) = ?) as this_month
        ', [now()->startOfMonth(), now()->month, now()->year])->first();
        $homesLastMonth = (int) ($homesMonthCounts->last_month ?? 0);
        $newHomesThisMonth = (int) ($homesMonthCounts->this_month ?? 0);
        $homesTrend = $homesLastMonth > 0 ? ($newHomesThisMonth / $homesLastMonth) * 100 : 0;

        // 4. Active Now
        $activeNow = User::where('updated_at', '>=', now()->subMinutes(60))->count();

        // 4.1 Invoice Stats (single query)
        $invoiceCounts = Invoice::selectRaw("
            COUNT(*) as total,
            SUM(status = 'paid') as paid,
            SUM(status = 'pending') as unpaid
        ")->first();
        $invoiceStats = [
            'total' => (int) ($invoiceCounts->total ?? 0),
            'paid' => (int) ($invoiceCounts->paid ?? 0),
            'unpaid' => (int) ($invoiceCounts->unpaid ?? 0),
        ];

        // 5. Bills Stats (status is computed from balance; use scopes)
        $billsStats = [
            'total' => Bill::count(),
            'pending' => Bill::unpaid()->count(),
            'fully_paid' => Bill::fullyPaid()->count(),
            'partial_paid' => Bill::unpaid()->count(),
            'forwarded' => 0,
            'balance_forwarded' => 0,
        ];
        $overdueBillsCount = Bill::unpaid()->where('due_date', '<', now())->count();

        $pendingBillsAmount = Bill::unpaid()->get()->sum(fn ($b) => $b->balance);

        // Total bills amount (water_consumption_volume * tariff + fix_charges + previous_balance) vs total payments
        $totalBillsAmount = (float) Bill::selectRaw('SUM(water_consumption_volume * tariff + fix_charges + COALESCE(previous_balance, 0)) as total')->value('total');
        $totalPaymentsAmount = (float) Payment::where('payable_type', Bill::class)->sum('amount');
        $billingPerformance = $totalBillsAmount > 0
            ? ($totalPaymentsAmount / $totalBillsAmount) * 100
            : 0;

        // 6. Tariffs
        $activeTariffsCount = Tariff::count();

        // 7. Readings & Consumption
        $totalReadingsThisMonth = MeterReading::whereMonth('reading_date', now()->month)
            ->whereYear('reading_date', now()->year)
            ->count();

        $totalConsumptionThisYear = MeterReading::whereYear('reading_date', now()->year)
            ->selectRaw('SUM(current_reading - previous_reading) as total')
            ->value('total') ?? 0;

        // 8. Water Usage Overview Chart Data (3 queries instead of 36)
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $usageByMonth = MeterReading::whereYear('reading_date', $year)
            ->selectRaw('MONTH(reading_date) as month, SUM(current_reading - previous_reading) as total')
            ->groupBy('month')
            ->pluck('total', 'month');
        $billsByMonth = Bill::whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->groupBy('month')
            ->pluck('total', 'month');
        $waterRevenueByMonth = Bill::whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month')
            ->selectRaw('SUM(water_consumption_volume * tariff) as total')
            ->groupBy('month')
            ->pluck('total', 'month');
        $paymentsByMonth = Payment::whereYear('payment_date', $year)
            ->selectRaw('MONTH(payment_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->pluck('total', 'month');

        $usageChartData = [];
        $billsChartData = [];
        $paymentChartData = [];
        $waterRevenueChartData = [];
        foreach ($months as $index => $monthName) {
            $m = $index + 1;
            $usageChartData[] = ['name' => $monthName, 'total' => round((float) ($usageByMonth[$m] ?? 0), 2)];
            $billsChartData[] = ['name' => $monthName, 'total' => (int) ($billsByMonth[$m] ?? 0)];
            $paymentChartData[] = ['name' => $monthName, 'total' => round((float) ($paymentsByMonth[$m] ?? 0), 2)];
            $waterRevenueChartData[] = ['name' => $monthName, 'total' => round((float) ($waterRevenueByMonth[$m] ?? 0), 2)];
        }

        // 9. Overdue Readings (No reading in > 30 days) - simplified logic
        // Assuming we want meters that have NOT had a reading in the last 30 days but are active
        $overdueReadings = Meter::where('status', 'active')
            ->whereDoesntHave('readings', function ($query) {
                $query->where('reading_date', '>=', now()->subDays(30));
            })
            ->with('customer')
            ->take(5)
            ->get()
            ->map(function ($meter) {
                return [
                    'serial_number' => $meter->meter_number,
                    'customer' => $meter->customer?->name ?? 'N/A',
                    'last_reading_date' => $meter->last_reading_date ?? 'Never',
                    'location' => $meter->customer?->address ?? 'N/A',
                ];
            });

        // 10. Overdue Bills List
        $overdueBillsList = Bill::unpaid()
            ->where('due_date', '<', now())
            ->with('customer')
            ->oldest('due_date')
            ->take(5)
            ->get()
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'bill_number' => $bill->bill_number,
                    'customer' => $bill->customer ? $bill->customer->name : 'N/A',
                    'amount' => $bill->balance,
                    'due_date' => $bill->due_date,
                    'status' => $bill->status,
                ];
            });

        return Inertia::render('admin/dashboard/index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'revenueTrend' => round($revenueTrend, 1),
                'meters' => $metersStats, // Grouped
                'metersTrend' => $metersTrend,
                'homes' => $homesStats, // Grouped
                'homesTrend' => round($homesTrend, 1),
                'activeNow' => $activeNow,
                'bills' => $billsStats, // Grouped
                'invoices' => $invoiceStats,
                'billingPerformance' => round($billingPerformance, 1),
                'totalBillsAmount' => round($totalBillsAmount, 2),
                'totalPaymentsAmount' => round($totalPaymentsAmount, 2),
                'pendingBillsAmount' => $pendingBillsAmount,
                'overdueBillsCount' => $overdueBillsCount,
                'activeTariffsCount' => $activeTariffsCount,
                'readingsThisMonth' => $totalReadingsThisMonth,
                'totalConsumptionThisYear' => round($totalConsumptionThisYear, 2),
                'zonesCount' => Zone::count(),
                'areasCount' => Area::count(),
            ],
            'chartData' => $usageChartData,
            'billsChartData' => $billsChartData,
            'paymentChartData' => $paymentChartData,
            'waterRevenueChartData' => $waterRevenueChartData,
            'usageByCategory' => $usageByCategory,
            'usageByZone' => $usageByZone,
            'overdueReadings' => $overdueReadings, // New
            'overdueBills' => $overdueBillsList, // New
        ]);
    }

    public function generalReport(Request $request)
    {
        $month = $request->input('month');
        $monthYear = null;
        $monthNumber = null;
        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            [$monthYear, $monthNumber] = array_map('intval', explode('-', $month));
        }

        $billQuery = Bill::query();
        if ($monthYear && $monthNumber) {
            $billQuery->whereYear('created_at', $monthYear)
                ->whereMonth('created_at', $monthNumber);
        }

        $totalBills = (clone $billQuery)->count();
        $paidBills = (clone $billQuery)->fullyPaid()->count();
        $unpaidBills = (clone $billQuery)->unpaid()->count();

        $paymentQuery = \App\Models\Payment::query();
        if ($monthYear && $monthNumber) {
            $paymentQuery->whereYear('payment_date', $monthYear)->whereMonth('payment_date', $monthNumber);
        }
        $totalPaidAmount = $paymentQuery->sum('amount');

        $outstandingAmount = (clone $billQuery)
            ->unpaid()
            ->get()->sum(fn ($b) => $b->balance);

        $readingQuery = MeterReading::query();
        if ($monthYear && $monthNumber) {
            $readingQuery->whereYear('reading_date', $monthYear)
                ->whereMonth('reading_date', $monthNumber);
        } else {
            $readingQuery->whereYear('reading_date', now()->year);
        }

        $totalConsumption = round(
            $readingQuery->selectRaw('SUM(current_reading - previous_reading) as total')
                ->value('total') ?? 0,
            2
        );

        $paymentRate = ($totalPaidAmount + $outstandingAmount) > 0
            ? ($totalPaidAmount / ($totalPaidAmount + $outstandingAmount)) * 100
            : 0;

        $usageByZone = Zone::all()->map(function ($zone) use ($monthYear, $monthNumber) {
            $usageQuery = MeterReading::join('customers', 'meter_readings.customer_id', '=', 'customers.id')
                ->where('customers.zone_id', $zone->id)
                ->selectRaw('SUM(current_reading - previous_reading) as total');

            if ($monthYear && $monthNumber) {
                $usageQuery->whereYear('reading_date', $monthYear)
                    ->whereMonth('reading_date', $monthNumber);
            } else {
                $usageQuery->whereYear('reading_date', now()->year);
            }

            $totalUsage = $usageQuery->value('total') ?? 0;

            return [
                'name' => $zone->name,
                'value' => round((float) $totalUsage, 2),
            ];
        });

        $overdueBillsCount = (clone $billQuery)
            ->whereIn('status', ['pending', 'partial paid'])
            ->where('due_date', '<', now())
            ->count();
        $overdueBillsAmount = (clone $billQuery)
            ->whereIn('status', ['pending', 'partial paid'])
            ->where('due_date', '<', now())
            ->get()->sum(fn ($b) => $b->balance);

        $overdueReadingsCount = Meter::where('status', 'active')
            ->whereDoesntHave('readings', function ($query) {
                $query->where('reading_date', '>=', now()->subDays(30));
            })
            ->count();

        $billsTotal = (clone $billQuery)->count();
        $fullyPaidBills = (clone $billQuery)->fullyPaid()->count();
        $collectionRate = $billsTotal > 0 ? ($fullyPaidBills / $billsTotal) * 100 : 0;

        $highlights = [
            [
                'label' => 'Overdue bills',
                'value' => number_format($overdueBillsCount),
                'description' => 'Pending balance: '.number_format($overdueBillsAmount, 2),
            ],
            [
                'label' => 'Readings overdue',
                'value' => number_format($overdueReadingsCount),
                'description' => 'Active meters without 30-day read',
            ],
            [
                'label' => 'Collection rate',
                'value' => number_format($collectionRate, 1).'%',
                'description' => 'Fully paid bills vs total',
            ],
        ];

        $customerStats = [
            'totalCustomers' => Customer::count(),
            'activeCustomers' => Customer::where('supply_status', 'active')->count(),
            'suspendedCustomers' => Customer::where('supply_status', 'suspended')->count(),
            'totalMeters' => Meter::count(),
            'metersActive' => Meter::where('status', 'active')->count(),
            'metersInactive' => Meter::where('status', 'inactive')->count(),
            'metersMaintenance' => Meter::whereIn('status', ['maintenance', 'damage'])->count(),
        ];

        return Inertia::render('admin/dashboard/general-report', [
            'stats' => [
                'totalBills' => $totalBills,
                'paidBills' => $paidBills,
                'unpaidBills' => $unpaidBills,
                'totalPaidAmount' => round($totalPaidAmount, 2),
                'outstandingAmount' => round($outstandingAmount, 2),
                'totalConsumption' => $totalConsumption,
                'paymentRate' => round($paymentRate, 1),
                'overdueBillsCount' => $overdueBillsCount,
                'overdueBillsAmount' => round($overdueBillsAmount, 2),
            ],
            'usageByZone' => $usageByZone,
            'highlights' => $highlights,
            'customerStats' => $customerStats,
            'filters' => $request->only(['month']),
        ]);
    }
}
