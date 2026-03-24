<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finance\Concerns\RendersFinanceOrAdminInertia;
use App\Models\Bill;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceDashboardController extends Controller
{
    use RendersFinanceOrAdminInertia;

    public function index()
    {
        return Inertia::render('finance/dashboard/index');
    }

    /**
     * Finance hub: recent bills, payments, invoices for the finance index page.
     */
    public function hub(Request $request)
    {
        $bills = Bill::with(['customer', 'meterReading.meter'])
            ->withSum('payments', 'amount')
            ->latest()
            ->limit(10)
            ->get();

        $payments = Payment::with(['payable.customer', 'receivedBy'])
            ->orderByDesc('payment_date')
            ->limit(10)
            ->get();

        $invoices = Invoice::with('customer')
            ->latest('created_at')
            ->limit(10)
            ->get();

        return $this->renderFinanceOrAdmin('finance/index', [
            'bills' => $bills,
            'payments' => $payments,
            'invoices' => $invoices,
        ]);
    }

    public function overview()
    {
        // 1. Revenue by Zone (Total Billed) — total_amount is accessor; use amount + previous_balance
        $revenueByZone = \App\Models\Zone::join('customers', 'zones.id', '=', 'customers.zone_id')
            ->join('bills', 'customers.id', '=', 'bills.customer_id')
            ->selectRaw('zones.name, sum(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) as total')
            ->groupBy('zones.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => (float) $item->total,
                ];
            });

        // 2. Revenue by Tariff (Total Billed) — total_amount is accessor; use amount + previous_balance
        $revenueByTariff = \App\Models\Tariff::join('customers', 'tariffs.id', '=', 'customers.tariff_id')
            ->join('bills', 'customers.id', '=', 'bills.customer_id')
            ->selectRaw('tariffs.name, sum(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) as total')
            ->groupBy('tariffs.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => (float) $item->total,
                ];
            });

        // 3. Debt Aging Report (Based on Due Date of Pending Bills)
        $now = now();
        $agingStats = [
            '0-30 Days' => \App\Models\Bill::unpaid()
                ->where('due_date', '>=', $now->copy()->subDays(30))
                ->get()->sum(fn ($b) => $b->balance),
            '31-60 Days' => \App\Models\Bill::unpaid()
                ->whereBetween('due_date', [$now->copy()->subDays(60), $now->copy()->subDays(31)])
                ->get()->sum(fn ($b) => $b->balance),
            '61-90 Days' => \App\Models\Bill::unpaid()
                ->whereBetween('due_date', [$now->copy()->subDays(90), $now->copy()->subDays(61)])
                ->get()->sum(fn ($b) => $b->balance),
            '90+ Days' => \App\Models\Bill::unpaid()
                ->where('due_date', '<', $now->copy()->subDays(90))
                ->get()->sum(fn ($b) => $b->balance),
        ];

        $agingChartData = [];
        foreach ($agingStats as $range => $amount) {
            $agingChartData[] = [
                'name' => $range,
                'amount' => (float) $amount,
            ];
        }

        return Inertia::render('finance/dashboard/financial-overview', [
            'revenueByZone' => $revenueByZone,
            'revenueByTariff' => $revenueByTariff,
            'agingChartData' => $agingChartData,
            'totalOutstanding' => array_sum($agingStats),
        ]);
    }
}
