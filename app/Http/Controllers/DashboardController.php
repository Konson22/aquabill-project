<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Home;
use App\Models\Invoice;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->department === 'finance') {
            // 1. Core Financial KPIs
            $totalCollected = Payment::sum('amount');
            $collectedToday = Payment::whereDate('payment_date', now())->sum('amount');
            
            $pendingBillAmount = Bill::whereIn('status', ['pending', 'partial paid'])->sum('current_balance');
            $pendingInvoiceAmount = Invoice::where('status', 'pending')->sum('amount');
            $totalPending = $pendingBillAmount + $pendingInvoiceAmount;

            // 2. Bills Breakdown
            $billStats = [
                'total' => Bill::count(),
                'pending' => Bill::where('status', 'pending')->count(),
                'fully_paid' => Bill::where('status', 'fully paid')->count(),
                'partial_paid' => Bill::where('status', 'partial paid')->count(),
                'forwarded' => Bill::where('status', 'forwarded')->count(),
                'balance_forwarded' => Bill::where('status', 'balance forwarded')->count(),
                'overdue' => Bill::whereIn('status', ['pending', 'partial paid'])
                    ->where('due_date', '<', now())
                    ->count(),
                'amount' => $pendingBillAmount
            ];
            
            // Calculate Performance
            $billingPerformance = $billStats['total'] > 0 
            ? ($billStats['fully_paid'] / $billStats['total']) * 100 
            : 0;

            // 3. Invoices Breakdown
            $invoiceStats = [
                'total' => Invoice::count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'unpaid' => Invoice::where('status', 'pending')->count(),
                'overdue' => Invoice::where('status', 'pending')->where('due_date', '<', now())->count(),
                'amount' => $pendingInvoiceAmount
            ];

            // 4. Revenue Trend (January to December)
            $revenueTrend = [];
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            foreach ($months as $index => $monthName) {
                $sum = Payment::whereMonth('payment_date', $index + 1)
                    ->whereYear('payment_date', now()->year)
                    ->sum('amount');
                $revenueTrend[] = [
                    'name' => $monthName,
                    'total' => round($sum, 2)
                ];
            }

            // 5. Overdue Bills (Older than 30 days)
            $overdueBills = Bill::whereIn('status', ['pending', 'partial paid'])
                ->where('due_date', '<', now()->subDays(30))
                ->with('customer')
                ->latest('due_date')
                ->take(6)
                ->get()
                ->map(function ($bill) {
                    return [
                        'id' => $bill->id,
                        'customer' => $bill->customer ? $bill->customer->name : 'N/A',
                        'amount' => $bill->current_balance,
                        'due_date' => $bill->due_date->format('M d, Y'),
                        'days_overdue' => now()->diffInDays($bill->due_date),
                    ];
                });

            return Inertia::render('dashboard-finance/index', [
                'stats' => [
                    'totalCollected' => $totalCollected,
                    'collectedToday' => $collectedToday,
                    'totalPending' => $totalPending,
                    'billStats' => $billStats, // Now includes detailed breakdown
                    'invoiceStats' => $invoiceStats,
                    'billingPerformance' => round($billingPerformance, 1),
                ],
                'revenueTrend' => $revenueTrend,
                'overdueBills' => $overdueBills
            ]);
        } elseif ($user->department === 'meters') {
            return Inertia::render('dashboard-meter-department/index');
        }

        // Admin Dashboard Data
        
        // Admin Dashboard Data
        
        // 1. Total Revenue
        $totalRevenue = Payment::sum('amount');
        $revenueLastMonth = Payment::whereMonth('payment_date', now()->subMonth()->month)
            ->whereYear('payment_date', now()->subMonth()->year)
            ->sum('amount');
        $revenueThisMonth = Payment::whereMonth('payment_date', now()->month)
            ->whereYear('payment_date', now()->year)
            ->sum('amount');
            
        $revenueTrend = 0;
        if ($revenueLastMonth > 0) {
            $revenueTrend = (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100;
        }

        // 2. Meters Stats
        $metersStats = [
            'total' => Meter::count(),
            'active' => Meter::where('status', 'active')->count(),
            'inactive' => Meter::where('status', 'inactive')->count(),
            'maintenance' => Meter::where('status', 'maintenance')->count(),
            'disconnected' => Meter::where('status', 'disconnected')->orWhere('status', 'disconnect')->count(),
            'damage' => Meter::where('status', 'damage')->count(),
        ];
        
        $metersLastMonth = Meter::whereDate('created_at', '<', now()->startOfMonth())->count();
        $newMetersThisMonth = Meter::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $metersTrend = $metersLastMonth > 0 ? ($newMetersThisMonth / $metersLastMonth) * 100 : 0; 

        // 3. Water Usage Breakdown by Category (Current Year)
        $tariffs = Tariff::all();
        $usageByCategory = $tariffs->map(function($tariff, $index) {
            $totalUsage = MeterReading::join('homes', 'meter_readings.home_id', '=', 'homes.id')
                ->where('homes.tariff_id', $tariff->id)
                ->whereYear('reading_date', now()->year)
                ->sum(DB::raw('current_reading - previous_reading'));

            $colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
            
            return [
                'name' => $tariff->name,
                'value' => round((float) $totalUsage, 2),
                'fill' => $colors[$index % count($colors)]
            ];
        });

        // 3.1 Water Usage by Zone (Current Year)
        $zones = Zone::all();
        $usageByZone = $zones->map(function($zone, $index) {
            $totalUsage = MeterReading::join('homes', 'meter_readings.home_id', '=', 'homes.id')
                ->where('homes.zone_id', $zone->id)
                ->whereYear('reading_date', now()->year)
                ->sum(DB::raw('current_reading - previous_reading'));

            $colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
            
            return [
                'name' => $zone->name,
                'value' => round((float) $totalUsage, 2),
                'fill' => $colors[$index % count($colors)]
            ];
        });
       
        // 4. Homes Stats
        $homesStats = [
            'total' => Home::count(),
            'active' => Home::where('supply_status', 'active')->count(),
            'suspended' => Home::where('supply_status', 'suspended')->count(),
            'disconnected' => Home::where('supply_status', 'disconnect')->count(),
        ];

        $homesLastMonth = Home::whereDate('created_at', '<', now()->startOfMonth())->count();
        $newHomesThisMonth = Home::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $homesTrend = $homesLastMonth > 0 ? ($newHomesThisMonth / $homesLastMonth) * 100 : 0;

        // 4. Active Now
        $activeNow = User::where('updated_at', '>=', now()->subMinutes(60))->count();

        // 5. Invoices & Bills Stats
        $billsStats = [
            'total' => Bill::count(),
            'pending' => Bill::where('status', 'pending')->count(),
            'fully_paid' => Bill::where('status', 'fully paid')->count(),
            'partial_paid' => Bill::where('status', 'partial paid')->count(),
            'forwarded' => Bill::where('status', 'forwarded')->count(),
            'balance_forwarded' => Bill::where('status', 'balance forwarded')->count(),
        ];
        
        $pendingBillsAmount = Bill::whereIn('status', ['pending', 'partial paid'])->sum('current_balance'); 
        
        $overdueBillsCount = Bill::whereIn('status', ['pending', 'partial paid'])
             ->where('due_date', '<', now())
             ->count();
        
        // 6. Tariffs
        $activeTariffsCount = Tariff::count(); 

        // 7. Readings & Consumption
        $totalReadingsThisMonth = MeterReading::whereMonth('reading_date', now()->month)
            ->whereYear('reading_date', now()->year)
            ->count();

        $totalConsumptionThisYear = MeterReading::whereYear('reading_date', now()->year)
            ->selectRaw('SUM(current_reading - previous_reading) as total')
            ->value('total') ?? 0;

        // 8. Water Usage Overview Chart Data (m³)
        $usageChartData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        foreach ($months as $index => $month) {
            $sum = MeterReading::whereMonth('reading_date', $index + 1)
                ->whereYear('reading_date', now()->year)
                ->selectRaw('SUM(current_reading - previous_reading) as total')
                ->value('total') ?? 0;
            $usageChartData[] = ['name' => $month, 'total' => round($sum, 2)];
        }

        // 9. Overdue Readings (No reading in > 30 days) - simplified logic
        // Assuming we want meters that have NOT had a reading in the last 30 days but are active
        $overdueReadings = Meter::where('status', 'active')
            ->whereDoesntHave('readings', function($query) {
                $query->where('reading_date', '>=', now()->subDays(30));
            })
            ->with('home.customer')
            ->take(5)
            ->get()
            ->map(function($meter) {
                 return [
                    'serial_number' => $meter->meter_number, // Updated to correct column name if needed, assuming 'meter_number' based on model fillable
                    'customer' => $meter->home && $meter->home->customer ? $meter->home->customer->name : 'N/A',
                    'last_reading_date' => $meter->last_reading_date ?? 'Never',
                    'location' => $meter->home ? $meter->home->address : 'N/A'
                 ];
            });

        // 10. Overdue Bills List
        $overdueBillsList = Bill::whereIn('status', ['pending', 'partial paid'])
            ->where('due_date', '<', now())
            ->with('customer')
            ->oldest('due_date')
            ->take(5)
            ->get()
            ->map(function($bill) {
                return [
                    'id' => $bill->id,
                    'bill_number' => $bill->bill_number,
                    'customer' => $bill->customer ? $bill->customer->name : 'N/A',
                    'amount' => $bill->current_balance,
                    'due_date' => $bill->due_date,
                    'status' => $bill->status
                ];
            });

        $billingPerformance = $billsStats['total'] > 0 
            ? ($billsStats['fully_paid'] / $billsStats['total']) * 100 
            : 0;

        return Inertia::render('dashboard-admin/index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'revenueTrend' => round($revenueTrend, 1),
                'meters' => $metersStats, // Grouped
                'metersTrend' => $metersTrend,
                'homes' => $homesStats, // Grouped
                'homesTrend' => round($homesTrend, 1),
                'activeNow' => $activeNow,
                'bills' => $billsStats, // Grouped
                'invoices' => [
                    'total' => Invoice::count(),
                    'paid' => Invoice::where('status', 'paid')->count(),
                    'unpaid' => Invoice::where('status', 'pending')->count(),
                ],
                'billingPerformance' => round($billingPerformance, 1),
                'pendingBillsAmount' => $pendingBillsAmount,
                'overdueBillsCount' => $overdueBillsCount,
                'activeTariffsCount' => $activeTariffsCount,
                'readingsThisMonth' => $totalReadingsThisMonth,
                'totalConsumptionThisYear' => round($totalConsumptionThisYear, 2),
            ],
            'chartData' => $usageChartData,
            'usageByCategory' => $usageByCategory,
            'usageByZone' => $usageByZone,
            'overdueReadings' => $overdueReadings, // New
            'overdueBills' => $overdueBillsList, // New
        ]);
    }
}
