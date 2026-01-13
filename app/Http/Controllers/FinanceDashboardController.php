<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard-finance/index');
    }

    public function overview()
    {
        // 1. Revenue by Zone (Total Billed)
        $revenueByZone = \App\Models\Zone::join('homes', 'zones.id', '=', 'homes.zone_id')
            ->join('bills', 'homes.id', '=', 'bills.home_id')
            ->selectRaw('zones.name, sum(bills.amount) as total')
            ->groupBy('zones.name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => (float) $item->total,
                ];
            });

        // 2. Revenue by Tariff (Total Billed)
        $revenueByTariff = \App\Models\Tariff::join('homes', 'tariffs.id', '=', 'homes.tariff_id')
            ->join('bills', 'homes.id', '=', 'bills.home_id')
            ->selectRaw('tariffs.name, sum(bills.amount) as total')
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
            '0-30 Days' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])
                ->where('due_date', '>=', $now->copy()->subDays(30))
                ->sum('current_balance'),
            '31-60 Days' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])
                ->whereBetween('due_date', [$now->copy()->subDays(60), $now->copy()->subDays(31)])
                ->sum('current_balance'),
            '61-90 Days' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])
                ->whereBetween('due_date', [$now->copy()->subDays(90), $now->copy()->subDays(61)])
                ->sum('current_balance'),
            '90+ Days' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])
                ->where('due_date', '<', $now->copy()->subDays(90))
                ->sum('current_balance'),
        ];

        $agingChartData = [];
        foreach ($agingStats as $range => $amount) {
            $agingChartData[] = [
                'name' => $range,
                'amount' => (float) $amount,
            ];
        }

        return Inertia::render('dashboard-finance/financial-overview', [
            'revenueByZone' => $revenueByZone,
            'revenueByTariff' => $revenueByTariff,
            'agingChartData' => $agingChartData,
            'totalOutstanding' => array_sum($agingStats),
        ]);
    }
}
