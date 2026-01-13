<?php

namespace App\Http\Controllers;

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
            
            $pendingBillAmount = \App\Models\Bill::whereIn('status', ['pending', 'overdue', 'partial_paid'])->sum('current_balance');
            $pendingInvoiceAmount = \App\Models\Invoice::where('status', 'pending')->sum('amount');
            $totalPending = $pendingBillAmount + $pendingInvoiceAmount;

            // 2. Bills Breakdown
            $billStats = [
                'total' => \App\Models\Bill::count(),
                'paid' => \App\Models\Bill::where('status', 'paid')->count(),
                'unpaid' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])->count(),
                'overdue' => \App\Models\Bill::where('status', 'overdue')->orWhere(function($q) {
                    $q->where('due_date', '<', now())->whereIn('status', ['pending', 'partial_paid']);
                })->count(),
                'amount' => $pendingBillAmount
            ];

            // 3. Invoices Breakdown
            $invoiceStats = [
                'total' => \App\Models\Invoice::count(),
                'paid' => \App\Models\Invoice::where('status', 'paid')->count(),
                'unpaid' => \App\Models\Invoice::where('status', 'pending')->count(),
                'overdue' => \App\Models\Invoice::where('status', 'pending')->where('due_date', '<', now())->count(),
                'amount' => $pendingInvoiceAmount
            ];

            // 4. Revenue Trend (Last 6 Months)
            $revenueTrend = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $sum = \App\Models\Payment::whereMonth('payment_date', $month->month)
                    ->whereYear('payment_date', $month->year)
                    ->sum('amount');
                $revenueTrend[] = [
                    'name' => $month->format('M'),
                    'total' => round($sum, 2)
                ];
            }

            // 5. Recent Payments
            $recentPayments = \App\Models\Payment::with(['payable'])
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($payment) {
                    $name = 'System User';
                    $type = 'Unknown';
                    
                    if ($payment->payable_type === 'App\Models\Bill') {
                        $type = 'Bill Payment';
                        if ($payment->payable && $payment->payable->customer) {
                            $name = $payment->payable->customer->name;
                        }
                    } elseif ($payment->payable_type === 'App\Models\Invoice') {
                        $type = 'Invoice Payment';
                        if ($payment->payable && $payment->payable->customer) {
                            $name = $payment->payable->customer->name;
                        }
                    }

                    return [
                        'id' => $payment->id,
                        'customer' => $name,
                        'type' => $type,
                        'amount' => $payment->amount,
                        'date' => $payment->payment_date->format('M d, Y'),
                        'method' => $payment->payment_method ?? 'Cash'
                    ];
                });

            return Inertia::render('dashboard-finance/index', [
                'stats' => [
                    'totalCollected' => $totalCollected,
                    'collectedToday' => $collectedToday,
                    'totalPending' => $totalPending,
                    'billStats' => $billStats,
                    'invoiceStats' => $invoiceStats,
                ],
                'revenueTrend' => $revenueTrend,
                'recentPayments' => $recentPayments
            ]);
        } elseif ($user->department === 'meters') {
            return Inertia::render('dashboard-meter-department/index');
        }

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

        // 2. Meters Stats
        $activeMetersCount = \App\Models\Meter::where('status', 'active')->count();
        $inactiveMetersCount = \App\Models\Meter::where('status', 'inactive')->count();
        $damageMetersCount = \App\Models\Meter::where('status', 'damage')->count();
        $maintenanceMetersCount = \App\Models\Meter::where('status', 'maintenance')->count();
        $totalMeters = \App\Models\Meter::count();
        
        $metersLastMonth = \App\Models\Meter::whereDate('created_at', '<', now()->startOfMonth())->count();
        $newMetersThisMonth = \App\Models\Meter::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $metersTrend = $metersLastMonth > 0 ? ($newMetersThisMonth / $metersLastMonth) * 100 : 0; 

        // Meter Status Distribution removed as requested
        // 3. Water Usage Breakdown by Category (Current Year)
        $tariffs = \App\Models\Tariff::all();
        $usageByCategory = $tariffs->map(function($tariff, $index) {
            $totalUsage = \App\Models\MeterReading::join('homes', 'meter_readings.home_id', '=', 'homes.id')
                ->where('homes.tariff_id', $tariff->id)
                ->whereYear('reading_date', now()->year)
                ->sum(\Illuminate\Support\Facades\DB::raw('current_reading - previous_reading'));

            $colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
            
            return [
                'name' => $tariff->name,
                'value' => round((float) $totalUsage, 2),
                'fill' => $colors[$index % count($colors)]
            ];
        });
       
        // 3. Total Customers
        $totalCustomers = \App\Models\Customer::count();
        $customersLastMonth = \App\Models\Customer::whereDate('created_at', '<', now()->startOfMonth())->count();
        $newCustomersThisMonth = \App\Models\Customer::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $customersTrend = $customersLastMonth > 0 ? ($newCustomersThisMonth / $customersLastMonth) * 100 : 0;

        // 4. Active Now
        $activeNow = \App\Models\User::where('updated_at', '>=', now()->subMinutes(60))->count();

        // 5. Invoices & Bills Stats
        $totalInvoicesCount = \App\Models\Invoice::count();
        $paidInvoicesCount = \App\Models\Invoice::where('status', 'paid')->count();
        $unpaidInvoicesCount = \App\Models\Invoice::where('status', 'pending')->count();
        $overdueInvoicesCount = \App\Models\Invoice::where('status', 'pending')
            ->where('due_date', '<', now())
            ->count();

        $totalBillsCount = \App\Models\Bill::count();
        $paidBillsCount = \App\Models\Bill::where('status', 'paid')->count();
        $unpaidBillsCount = \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])->count();
        
        $pendingBillsAmount = \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])->sum('current_balance'); 
        
        $overdueBillsCount = \App\Models\Bill::where('status', 'overdue')->orWhere(function($q) {
             $q->where('due_date', '<', now())->whereIn('status', ['pending', 'partial_paid']);
        })->count();
        
        // 6. Tariffs
        $activeTariffsCount = \App\Models\Tariff::count(); // Assuming all are relevant, or check generic active flag if exists

        // 7. Readings & Consumption
        $totalReadingsThisMonth = \App\Models\MeterReading::whereMonth('reading_date', now()->month)
            ->whereYear('reading_date', now()->year)
            ->count();

        $totalConsumptionThisYear = \App\Models\MeterReading::whereYear('reading_date', now()->year)
            ->selectRaw('SUM(current_reading - previous_reading) as total')
            ->value('total') ?? 0;

        // 8. Water Usage Overview Chart Data (m³)
        $usageChartData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        foreach ($months as $index => $month) {
            $sum = \App\Models\MeterReading::whereMonth('reading_date', $index + 1)
                ->whereYear('reading_date', now()->year)
                ->selectRaw('SUM(current_reading - previous_reading) as total')
                ->value('total') ?? 0;
            $usageChartData[] = ['name' => $month, 'total' => round($sum, 2)];
        }

        // 9. Recent Sales/Activity
        $recentPayments = \App\Models\Payment::with(['payable' => function($query) {
                // Try to eager load if possible
            }])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                $name = 'Unknown';
                $email = 'N/A';
                
                if ($payment->payable && method_exists($payment->payable, 'customer') && $payment->payable->customer) {
                     if ($payment->payable->customer) {
                         $name = $payment->payable->customer->name;
                         $email = $payment->payable->customer->email;
                     }
                }

                return [
                    'name' => $name,
                    'email' => $email,
                    'amount' => $payment->amount,
                    'avatar' => '/avatars/01.png', 
                    'fallback' => strtoupper(substr($name, 0, 2)),
                ];
            });

        return Inertia::render('dashboard-admin/index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'revenueTrend' => round($revenueTrend, 1),
                'activeMeters' => $activeMetersCount,
                'inactiveMeters' => $inactiveMetersCount,
                'damageMeters' => $damageMetersCount,
                'maintenanceMeters' => $maintenanceMetersCount,
                'metersTrend' => $newMetersThisMonth,
                'totalMeters' => $totalMeters,
                'totalCustomers' => $totalCustomers,
                'customersTrend' => round($customersTrend, 1),
                'activeNow' => $activeNow,
                'totalInvoices' => $totalInvoicesCount,
                'paidInvoices' => $paidInvoicesCount,
                'unpaidInvoices' => $unpaidInvoicesCount,
                'overdueInvoices' => $overdueInvoicesCount,
                'totalBills' => $totalBillsCount,
                'paidBills' => $paidBillsCount,
                'unpaidBills' => $unpaidBillsCount,
                'pendingBillsAmount' => $pendingBillsAmount,
                'overdueBillsCount' => $overdueBillsCount,
                'activeTariffsCount' => $activeTariffsCount,
                'readingsThisMonth' => $totalReadingsThisMonth,
                'totalConsumptionThisYear' => round($totalConsumptionThisYear, 2),
            ],
            'chartData' => $usageChartData,
            'usageByCategory' => $usageByCategory,
            'recentSales' => $recentPayments
        ]);
    }
}
