<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Neighborhood;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Return dashboard statistics as JSON.
     */
    public function index(): JsonResponse
    {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

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
            'recentActivity' => $this->getRecentActivity(),
            'monthlyRevenue' => $this->getMonthlyRevenue($currentYear),
            'topCustomers' => $this->getTopCustomers(),
            'meterStatus' => $this->getMeterStatus(),
            'outstandingAmount' => (float) Bill::where('status', 'unpaid')->sum('current_balance'),
            'thisMonthBills' => (int) Bill::whereYear('billing_period_end', $currentYear)->whereMonth('billing_period_end', $currentMonth)->count(),
            'thisMonthRevenue' => (float) Payment::whereYear('payment_date', $currentYear)->whereMonth('payment_date', $currentMonth)->sum('amount_paid'),
            'thisMonthReadings' => (int) MeterReading::whereYear('date', $currentYear)->whereMonth('date', $currentMonth)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Dashboard statistics retrieved successfully'
        ], 200);
    }

    private function getMonthlyConsumption(int $month, int $year): float|int
    {
        $readings = MeterReading::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        return $readings->sum(function ($reading) {
            return ($reading->value ?? 0) - ($reading->previous ?? 0);
        }) ?? 0;
    }

    private function getRecentActivity()
    {
        $activities = collect();

        $recentCustomers = Customer::latest()->take(3)->get();
        foreach ($recentCustomers as $customer) {
            $customerName = $customer->full_name ?? 'Unknown Customer';
            $activities->push([
                'type' => 'customer_registered',
                'message' => "New customer registered: {$customerName}",
                'time' => $customer->created_at?->diffForHumans(),
                'color' => 'green',
            ]);
        }

        $recentBills = Bill::with('customer')->latest()->take(3)->get();
        foreach ($recentBills as $bill) {
            $customerName = $bill->customer ? ($bill->customer->full_name ?? 'Unknown Customer') : 'Unknown Customer';
            $activities->push([
                'type' => 'bill_generated',
                'message' => "Bill generated for {$customerName}",
                'time' => $bill->created_at?->diffForHumans(),
                'color' => 'blue',
            ]);
        }

        $recentPayments = Payment::with(['bill.customer'])->latest()->take(3)->get();
        foreach ($recentPayments as $payment) {
            $customerName = 'Unknown';
            if ($payment->bill && $payment->bill->customer) {
                $customerName = $payment->bill->customer->full_name ?? 'Unknown';
            }
            $activities->push([
                'type' => 'payment_received',
                'message' => "Payment received from {$customerName}",
                'time' => $payment->created_at?->diffForHumans(),
                'color' => 'purple',
            ]);
        }

        return $activities->sortByDesc('time')->take(5)->values();
    }

    private function getMonthlyRevenue(int $year)
    {
        $revenueData = Payment::selectRaw('MONTH(payment_date) as month, SUM(amount_paid) as total')
            ->whereYear('payment_date', $year)
            ->whereNotNull('payment_date')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $completeYear = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthData = $revenueData->where('month', $month)->first();
            $completeYear[] = [
                'month' => Carbon::create()->month($month)->format('M'),
                'amount' => $monthData ? (float) $monthData->total : 0,
            ];
        }

        return $completeYear;
    }

    private function getTopCustomers()
    {
        return Customer::with(['bills' => function ($query) {
                $query->select('customer_id', 'consumption');
            }])
            ->take(5)
            ->get()
            ->map(function ($customer) {
                $totalConsumption = $customer->bills->sum('consumption') ?? 0;
                return [
                    'name' => $customer->full_name ?? 'Unknown Customer',
                    'consumption' => $totalConsumption,
                    'account_number' => $customer->account_number ?? 'N/A',
                ];
            })
            ->sortByDesc('consumption')
            ->values();
    }

    private function getMeterStatus()
    {
        return Meter::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status ?? 'Unknown'),
                    'count' => $item->count ?? 0,
                ];
            });
    }
}


