<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Neighborhood;
use App\Models\MeterReading;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get current month and year for calculations
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        // Calculate dashboard statistics
        $stats = [
            'totalCustomers' => Customer::count() ?? 0,
            'activeMeters' => Meter::active()->count() ?? 0,
            'totalBills' => Bill::count() ?? 0,
            'totalRevenue' => Payment::sum('amount_paid') ?? 0,
            'pendingPayments' => Bill::unpaid()->count() ?? 0,
            'overdueBills' => Bill::where('status', 'unpaid')
                ->where('billing_period_end', '<', Carbon::now())
                ->count() ?? 0,
            'monthlyConsumption' => $this->getMonthlyConsumption($currentMonth, $currentYear),
            'totalAreas' => Neighborhood::count() ?? 0,
            'overdueReadings' => $this->getOverdueReadings(),
            'monthlyRevenue' => $this->getMonthlyRevenue($currentYear),
            'topCustomers' => $this->getTopCustomers(),
            'meterStatus' => $this->getMeterStatus(),
            'outstandingAmount' => (float) Bill::where('status', 'unpaid')->sum('current_balance'),
            'thisMonthBills' => (int) Bill::whereYear('billing_period_end', $currentYear)->whereMonth('billing_period_end', $currentMonth)->count(),
            'thisMonthRevenue' => (float) Payment::whereYear('payment_date', $currentYear)->whereMonth('payment_date', $currentMonth)->sum('amount_paid'),
            'thisMonthReadings' => (int) MeterReading::whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->count(),
        ];

        return Inertia::render('dashboard/index', [
            'stats' => $stats
        ]);
    }

    /**
     * Statistics page data provider
     */
    public function statistics()
    {
        $currentYear = Carbon::now()->year;
        $currentMonth = Carbon::now()->month;

        $monthlyRevenue = $this->getMonthlyRevenue($currentYear);

        // Monthly consumption series
        $consumptionSeries = [];
        for ($month = 1; $month <= 12; $month++) {
            $consumptionSeries[] = [
                'month' => Carbon::create()->month($month)->format('M'),
                'consumption' => (float) MeterReading::whereYear('date', $currentYear)->whereMonth('date', $month)->get()->sum(function($r){return $r->value - $r->previous;})
            ];
        }

        // Meter status with colors
        $meterStatusRaw = $this->getMeterStatus();
        $statusColorMap = [
            'Active' => '#10B981',
            'Inactive' => '#6B7280',
            'Faulty' => '#EF4444',
        ];
        $meterStatus = collect($meterStatusRaw)->map(function($item) use ($statusColorMap){
            return [
                'name' => $item['status'],
                'value' => (int) $item['count'],
                'color' => $statusColorMap[$item['status']] ?? '#3B82F6'
            ];
        })->values();

        // Top customers by revenue (this year)
        $topPayers = Bill::select('customer_id', DB::raw('SUM(total_amount) as amount'))
            ->whereYear('billing_period_end', $currentYear)
            ->groupBy('customer_id')
            ->orderByDesc('amount')
            ->take(5)
            ->get()
            ->map(function($row){
                $customer = Customer::find($row->customer_id);
                return [
                    'name' => $customer?->full_name ?? 'Unknown',
                    'amount' => (float) $row->amount,
                    'account_number' => $customer?->account_number ?? 'N/A'
                ];
            });

        return Inertia::render('statistics/index', [
            'monthlyRevenue' => $monthlyRevenue,
            'consumptionSeries' => $consumptionSeries,
            'meterStatus' => $meterStatus,
            'topPayers' => $topPayers,
            'kpis' => [
                'thisMonthRevenue' => (float) Payment::whereYear('payment_date', $currentYear)->whereMonth('payment_date', $currentMonth)->sum('amount_paid'),
                'thisMonthBills' => (int) Bill::whereYear('billing_period_end', $currentYear)->whereMonth('billing_period_end', $currentMonth)->count(),
                'thisMonthReadings' => (int) MeterReading::whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->count(),
                'outstandingAmount' => (float) Bill::where('status', 'unpaid')->sum('current_balance'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get dashboard data as API response for testing
     */
    public function api()
    {
        // Get current month and year for calculations
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        // Calculate dashboard statistics
        $stats = [
            'totalCustomers' => Customer::count() ?? 0,
            'activeMeters' => Meter::active()->count() ?? 0,
            'totalBills' => Bill::count() ?? 0,
            'totalRevenue' => Payment::sum('amount_paid') ?? 0,
            'pendingPayments' => Bill::unpaid()->count() ?? 0,
            'overdueBills' => Bill::where('status', 'unpaid')
                ->where('billing_period_end', '<', Carbon::now())
                ->count() ?? 0,
            'monthlyConsumption' => $this->getMonthlyConsumption($currentMonth, $currentYear),
            'totalAreas' => Neighborhood::count() ?? 0,
            'overdueReadings' => $this->getOverdueReadings(),
            'monthlyRevenue' => $this->getMonthlyRevenue($currentYear),
            'topCustomers' => $this->getTopCustomers(),
            'meterStatus' => $this->getMeterStatus(),
            'outstandingAmount' => (float) Bill::where('status', 'unpaid')->sum('current_balance'),
            'thisMonthBills' => (int) Bill::whereYear('billing_period_end', $currentYear)->whereMonth('billing_period_end', $currentMonth)->count(),
            'thisMonthRevenue' => (float) Payment::whereYear('payment_date', $currentYear)->whereMonth('payment_date', $currentMonth)->sum('amount_paid'),
            'thisMonthReadings' => (int) MeterReading::whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get monthly consumption for the current month
     */
    private function getMonthlyConsumption($month, $year)
    {
        $readings = MeterReading::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();
        
        return $readings->sum(function($reading) {
            return $reading->value - $reading->previous;
        }) ?? 0;
    }

    /**
     * Get recent activity for the dashboard
     */
    private function getRecentActivity()
    {
        $activities = collect();

        // Recent customer registrations
        $recentCustomers = Customer::latest()->take(3)->get();
        foreach ($recentCustomers as $customer) {
            $customerName = $customer->full_name ?? 'Unknown Customer';
            $activities->push([
                'type' => 'customer_registered',
                'message' => "New customer registered: {$customerName}",
                'time' => $customer->created_at->diffForHumans(),
                'color' => 'green'
            ]);
        }

        // Recent bills generated
        $recentBills = Bill::with('customer')->latest()->take(3)->get();
        foreach ($recentBills as $bill) {
            $customerName = $bill->customer ? $bill->customer->full_name : 'Unknown Customer';
            $activities->push([
                'type' => 'bill_generated',
                'message' => "Bill generated for {$customerName}",
                'time' => $bill->created_at->diffForHumans(),
                'color' => 'blue'
            ]);
        }

        // Recent payments
        $recentPayments = Payment::with(['bill.customer'])->latest()->take(3)->get();
        foreach ($recentPayments as $payment) {
            $customerName = 'Unknown';
            if ($payment->bill && $payment->bill->customer) {
                $customerName = $payment->bill->customer->full_name;
            }
            $activities->push([
                'type' => 'payment_received',
                'message' => "Payment received from {$customerName}",
                'time' => $payment->created_at->diffForHumans(),
                'color' => 'purple'
            ]);
        }

        return $activities->sortByDesc('time')->take(5)->values();
    }

    /**
     * Get monthly revenue data for charts
     */
    private function getMonthlyRevenue($year)
    {
        $revenueData = Payment::selectRaw('MONTH(payment_date) as month, SUM(amount_paid) as total')
            ->whereYear('payment_date', $year)
            ->whereNotNull('payment_date')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Create a complete year array with all months
        $completeYear = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthData = $revenueData->where('month', $month)->first();
            $completeYear[] = [
                'month' => Carbon::create()->month($month)->format('M'),
                'revenue' => $monthData ? (float) $monthData->total : 0.0
            ];
        }

        return $completeYear;
    }

    /**
     * Get top customers by consumption
     */
    private function getTopCustomers()
    {
        return Customer::with(['bills' => function($query) {
                $query->select('customer_id', 'consumption');
            }])
            ->take(5)
            ->get()
            ->map(function ($customer) {
                $totalConsumption = $customer->bills->sum('consumption') ?? 0;
                return [
                    'name' => $customer->full_name ?? 'Unknown Customer',
                    'consumption' => $totalConsumption,
                    'account_number' => $customer->account_number ?? 'N/A'
                ];
            })
            ->sortByDesc('consumption')
            ->values();
    }

    /**
     * Get meter status distribution
     */
    private function getMeterStatus()
    {
        return Meter::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status ?? 'Unknown'),
                    'count' => $item->count ?? 0
                ];
            });
    }

    /**
     * Get customers with overdue readings (no reading for more than 1 month)
     */
    private function getOverdueReadings()
    {
        $oneMonthAgo = Carbon::now()->subMonth();
        
        // Get customers who have meters but no readings in the last month
        $customersWithOverdueReadings = Customer::with(['meter', 'neighborhood'])
            ->whereHas('meter')
            ->whereDoesntHave('meter.readings', function($query) use ($oneMonthAgo) {
                $query->where('date', '>=', $oneMonthAgo);
            })
            ->orWhereHas('meter.readings', function($query) use ($oneMonthAgo) {
                $query->where('date', '<', $oneMonthAgo)
                      ->whereNotExists(function($subQuery) use ($oneMonthAgo) {
                          $subQuery->select(DB::raw(1))
                                   ->from('meter_readings as mr2')
                                   ->whereColumn('mr2.meter_id', 'meter_readings.meter_id')
                                   ->where('mr2.date', '>=', $oneMonthAgo);
                      });
            })
            ->take(10)
            ->get()
            ->map(function ($customer) use ($oneMonthAgo) {
                $lastReading = $customer->meter?->readings()
                    ->orderBy('date', 'desc')
                    ->first();
                
                $daysSinceLastReading = $lastReading 
                    ? $lastReading->date->diffInDays(Carbon::now())
                    : 'Never';
                
                return [
                    'id' => $customer->id,
                    'name' => $customer->full_name ?? 'Unknown Customer',
                    'account_number' => $customer->account_number ?? 'N/A',
                    'neighborhood' => $customer->neighborhood?->name ?? 'Unknown',
                    'meter_serial' => $customer->meter?->serial ?? 'N/A',
                    'last_reading_date' => $lastReading?->date?->format('Y-m-d') ?? 'Never',
                    'days_since_reading' => $daysSinceLastReading,
                    'phone' => $customer->phone ?? 'N/A',
                ];
            });

        return $customersWithOverdueReadings;
    }
}
