<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Bill::with(['customer', 'home.zone', 'home.meter', 'meterReading']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('bill_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('home', function($q) use ($search) {
                      $q->where('address', 'like', "%{$search}%")
                        ->orWhereHas('zone', function($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('meter', function($q) use ($search) {
                             $q->where('meter_number', 'like', "%{$search}%");
                        });
                  });
            });
        }

        $bills = $query->latest()->paginate(10)->withQueryString();
        return Inertia::render('bills/index', [
            'bills' => $bills,
            'filters' => $request->only(['search']),
        ]);
    }

    public function report(Request $request)
    {
        $tariffId = $request->input('tariff_id');
        $zoneId = $request->input('zone_id');

        $applyFilters = function ($query) use ($tariffId, $zoneId) {
            if ($tariffId) $query->where('homes.tariff_id', $tariffId);
            if ($zoneId) $query->where('homes.zone_id', $zoneId);
        };

        // 1. Monthly Performance (Paid vs Unpaid)
        $monthlyTrend = \App\Models\Bill::query()
            ->join('homes', 'bills.home_id', '=', 'homes.id')
            ->selectRaw("DATE_FORMAT(bills.created_at, '%Y-%m') as month")
            ->selectRaw('SUM(bills.total_amount - bills.current_balance) as paid')
            ->selectRaw('SUM(bills.current_balance) as unpaid')
            ->where('bills.created_at', '>=', now()->subMonths(11)->startOfMonth());
        $applyFilters($monthlyTrend);
        $monthlyTrend = $monthlyTrend->groupBy('month')->orderBy('month')->get();

        // 2. Bills by Status
        $billsByStatusQuery = \App\Models\Bill::query()
            ->join('homes', 'bills.home_id', '=', 'homes.id');
        $applyFilters($billsByStatusQuery);
        $billsByStatus = $billsByStatusQuery
            ->selectRaw('status as name, COUNT(*) as value')
            ->groupBy('status')
            ->get();

        // 3. Billing counts by Tariff
        $billingByTariff = \App\Models\Tariff::query()
            ->leftJoin('homes', 'tariffs.id', '=', 'homes.tariff_id')
            ->leftJoin('bills', 'homes.id', '=', 'bills.home_id')
            ->select('tariffs.name as name')
            ->selectRaw('COUNT(bills.id) as total')
            ->selectRaw("SUM(CASE WHEN bills.status = 'paid' THEN 1 ELSE 0 END) as paid")
            ->selectRaw("SUM(CASE WHEN bills.status IN ('pending', 'partial_paid', 'overdue') THEN 1 ELSE 0 END) as unpaid")
            ->selectRaw("SUM(CASE WHEN bills.status = 'overdue' THEN 1 ELSE 0 END) as overdue")
            ->when($tariffId, fn($q) => $q->where('tariffs.id', $tariffId))
            ->when($zoneId, fn($q) => $q->where('homes.zone_id', $zoneId))
            ->groupBy('tariffs.id', 'tariffs.name')
            ->get();

        // 4. Billing counts by Zone
        $billingByZone = \App\Models\Zone::query()
            ->leftJoin('homes', 'zones.id', '=', 'homes.zone_id')
            ->leftJoin('bills', 'homes.id', '=', 'bills.home_id')
            ->select('zones.name as name')
            ->selectRaw('COUNT(bills.id) as total')
            ->selectRaw("SUM(CASE WHEN bills.status = 'paid' THEN 1 ELSE 0 END) as paid")
            ->selectRaw("SUM(CASE WHEN bills.status IN ('pending', 'partial_paid', 'overdue') THEN 1 ELSE 0 END) as unpaid")
            ->selectRaw("SUM(CASE WHEN bills.status = 'overdue' THEN 1 ELSE 0 END) as overdue")
            ->when($tariffId, fn($q) => $q->where('homes.tariff_id', $tariffId))
            ->when($zoneId, fn($q) => $q->where('zones.id', $zoneId))
            ->groupBy('zones.id', 'zones.name')
            ->get();

        // KPIs
        $kpiQuery = \App\Models\Bill::query()
            ->join('homes', 'bills.home_id', '=', 'homes.id');
        $applyFilters($kpiQuery);
        
        $totalBilled = (clone $kpiQuery)->sum('total_amount');
        $totalCollected = (clone $kpiQuery)->sum(\DB::raw('total_amount - current_balance'));
        $totalOutstanding = (clone $kpiQuery)->sum('current_balance');
        $collectionRate = $totalBilled > 0 ? ($totalCollected / $totalBilled) * 100 : 0;
        
        $allBillsCount = (clone $kpiQuery)->count();
        $paidBillsCount = (clone $kpiQuery)->where('bills.status', 'paid')->count();
        $unpaidBillsCount = (clone $kpiQuery)->whereIn('bills.status', ['pending', 'partial_paid', 'overdue'])->count();
        $overdueBillsCount = (clone $kpiQuery)->where('bills.status', 'overdue')->count();

        return Inertia::render('bills/report', [
            'monthlyTrend' => $monthlyTrend,
            'billsByStatus' => $billsByStatus,
            'billingByTariff' => $billingByTariff,
            'billingByZone' => $billingByZone,
            'kpis' => [
                'totalBilled' => $totalBilled,
                'totalCollected' => $totalCollected,
                'totalOutstanding' => $totalOutstanding,
                'collectionRate' => round($collectionRate, 2),
                'allBillsCount' => $allBillsCount,
                'paidBillsCount' => $paidBillsCount,
                'unpaidBillsCount' => $unpaidBillsCount,
                'overdueBillsCount' => $overdueBillsCount,
            ],
            'filters' => $request->only(['tariff_id', 'zone_id']),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
        ]);
    }

    public function export(Request $request)
    {
        $tariffId = $request->input('tariff_id');
        $zoneId = $request->input('zone_id');

        if ($tariffId === 'all') $tariffId = null;
        if ($zoneId === 'all') $zoneId = null;

        return response()->streamDownload(function () use ($tariffId, $zoneId) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['BILLING & COLLECTIONS REPORT - ' . date('Y-m-d')]);
            fputcsv($file, []);

            // Summary
            $kpiQuery = \App\Models\Bill::query()->join('homes', 'bills.home_id', '=', 'homes.id')
                ->when($tariffId, fn($q) => $q->where('homes.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('homes.zone_id', $zoneId));
            
            $totalBilled = (clone $kpiQuery)->sum('total_amount');
            $totalCollected = (clone $kpiQuery)->sum(\DB::raw('total_amount - current_balance'));
            $allBillsCount = (clone $kpiQuery)->count();
            $paidBillsCount = (clone $kpiQuery)->where('bills.status', 'paid')->count();
            $unpaidBillsCount = (clone $kpiQuery)->whereIn('bills.status', ['pending', 'partial_paid', 'overdue'])->count();
            
            fputcsv($file, ['KPI SUMMARY']);
            fputcsv($file, ['Total Billed Amount', number_format($totalBilled, 2)]);
            fputcsv($file, ['Total Paid Amount', number_format($totalCollected, 2)]);
            fputcsv($file, ['Total Unpaid Amount', number_format($totalBilled - $totalCollected, 2)]);
            fputcsv($file, ['Total Bills Count', $allBillsCount]);
            fputcsv($file, ['Paid Bills Count', $paidBillsCount]);
            fputcsv($file, ['Unpaid Bills Count', $unpaidBillsCount]);
            fputcsv($file, []);

            // Monthly
            fputcsv($file, ['MONTHLY PERFORMANCE']);
            fputcsv($file, ['Month', 'Billed', 'Collected']);
            $monthlyData = \App\Models\Bill::query()->join('homes', 'bills.home_id', '=', 'homes.id')
                ->selectRaw("DATE_FORMAT(bills.created_at, '%Y-%m') as month, SUM(total_amount) as billed, SUM(total_amount - current_balance) as collected")
                ->when($tariffId, fn($q) => $q->where('homes.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('homes.zone_id', $zoneId))
                ->groupBy('month')->orderBy('month')->get();
            foreach ($monthlyData as $row) fputcsv($file, [$row->month, $row->billed, $row->collected]);
            fputcsv($file, []);

            // Zone
            fputcsv($file, ['PERFORMANCE BY ZONE']);
            fputcsv($file, ['Zone Name', 'Billed', 'Collected']);
            $zoneData = \App\Models\Zone::query()
                ->leftJoin('homes', 'zones.id', '=', 'homes.zone_id')
                ->leftJoin('bills', 'homes.id', '=', 'bills.home_id')
                ->select('zones.name as name')
                ->selectRaw('COALESCE(SUM(bills.total_amount), 0) as billed, COALESCE(SUM(bills.total_amount - bills.current_balance), 0) as collected')
                ->when($tariffId, fn($q) => $q->where('homes.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('zones.id', $zoneId))
                ->groupBy('zones.id', 'zones.name')->get();
            foreach ($zoneData as $row) fputcsv($file, [$row->name, $row->billed, $row->collected]);

            fclose($file);
        }, 'billing_report_' . date('Y-m-d') . '.csv');
    }

    public function show($id)
    {
        $bill = \App\Models\Bill::with(['customer', 'home.tariff', 'home.zone', 'home.area', 'meterReading.meter', 'meterReading.reader', 'payments'])->findOrFail($id);
        return Inertia::render('bills/show', [
            'bill' => $bill,
        ]);
    }


    public function print($id)
    {
        $bill = \App\Models\Bill::with(['customer', 'home.tariff', 'home.zone', 'home.area', 'meterReading.meter'])->findOrFail($id);
        return Inertia::render('bills/print-single', [
            'bill' => $bill,
        ]);
    }

    public function bulkPrint(Request $request)
    {
        $ids = explode(',', $request->input('ids', ''));
        $bills = \App\Models\Bill::with(['customer', 'home.tariff', 'home.zone', 'home.area', 'meterReading.meter'])
            ->whereIn('id', $ids)
            ->get();
            
        return Inertia::render('bills/print-multiple', [
            'bills' => $bills,
        ]);
    }

    public function destroy($id)
    {
        $bill = \App\Models\Bill::findOrFail($id);
        
        // Also revert the meter reading status if needed, or handle related data cleanup
        if ($bill->meterReading) {
             $bill->meterReading->update(['status' => 'pending']);
        }

        $bill->delete();

        return redirect()->route('bills')->with('success', 'Bill deleted successfully.');
    }
}
