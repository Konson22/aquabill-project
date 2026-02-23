<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BillController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Bill::with(['customer.zone', 'customer.meter', 'meterReading.meter'])
            ->withSum('payments', 'amount');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('bill_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('customer', function($q) use ($search) {
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

    public function printingList()
    {
        $bills = \App\Models\Bill::with(['customer.zone', 'customer.meter', 'meterReading'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('bills/bill-printing-list', [
            'bills' => $bills,
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

            // Summary — collected from payments
            $kpiQuery = \App\Models\Bill::query()->join('customers', 'bills.customer_id', '=', 'customers.id')
                ->when($tariffId, fn($q) => $q->where('customers.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('customers.zone_id', $zoneId));
            $billIds = (clone $kpiQuery)->pluck('bills.id');
            $totalBilled = (clone $kpiQuery)->selectRaw('SUM(bills.amount + bills.previous_balance) as total')->value('total') ?? 0;
            $totalCollected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                ->whereIn('payable_id', $billIds)
                ->sum('amount');
            $allBillsCount = (clone $kpiQuery)->count();
            $paidBillsCount = (clone $kpiQuery)->where('bills.status', 'fully paid')->count();
            $unpaidBillsCount = (clone $kpiQuery)->whereIn('bills.status', ['pending', 'partial paid'])->count();
            
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
            $monthlyData = \App\Models\Bill::query()->join('customers', 'bills.customer_id', '=', 'customers.id')
                ->selectRaw("DATE_FORMAT(bills.created_at, '%Y-%m') as month, SUM(bills.amount + bills.previous_balance) as billed")
                ->when($tariffId, fn($q) => $q->where('customers.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('customers.zone_id', $zoneId))
                ->groupBy('month')->orderBy('month')->get()
                ->map(function ($row) {
                    $collected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                        ->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$row->month])
                        ->sum('amount');
                    return [
                        'month' => $row->month,
                        'billed' => (float) ($row->billed ?? 0),
                        'collected' => (float) $collected,
                    ];
                });
            foreach ($monthlyData as $row) fputcsv($file, [$row['month'], $row['billed'], $row['collected']]);
            fputcsv($file, []);

            // Zone
            fputcsv($file, ['PERFORMANCE BY ZONE']);
            fputcsv($file, ['Zone Name', 'Billed', 'Collected']);
            $zoneData = \App\Models\Zone::query()
                ->leftJoin('customers', 'zones.id', '=', 'customers.zone_id')
                ->leftJoin('bills', 'customers.id', '=', 'bills.customer_id')
                ->select('zones.id', 'zones.name as name')
                ->selectRaw('COALESCE(SUM(bills.amount + bills.previous_balance), 0) as billed')
                ->when($tariffId, fn($q) => $q->where('customers.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('zones.id', $zoneId))
                ->groupBy('zones.id', 'zones.name')
                ->get()
                ->map(function ($row) {
                    $zoneBillIds = \App\Models\Bill::join('customers', 'bills.customer_id', '=', 'customers.id')
                        ->where('customers.zone_id', $row->id)
                        ->pluck('bills.id');
                    $collected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                        ->whereIn('payable_id', $zoneBillIds)
                        ->sum('amount');
                    return [
                        'name' => $row->name,
                        'billed' => (float) ($row->billed ?? 0),
                        'collected' => (float) $collected,
                    ];
                });
            foreach ($zoneData as $row) fputcsv($file, [$row['name'], $row['billed'], $row['collected']]);

            fclose($file);
        }, 'billing_report_' . date('Y-m-d') . '.csv');
    }

    public function show($id)
    {
        $bill = \App\Models\Bill::with(['customer.tariff', 'customer.zone', 'customer.area', 'meterReading.meter', 'meterReading.reader', 'payments'])
            ->withSum('payments', 'amount')
            ->findOrFail($id);
        return Inertia::render('bills/show', [
            'bill' => $bill,
        ]);
    }


    public function print($id)
    {
        $bill = \App\Models\Bill::with(['customer.tariff', 'customer.zone', 'customer.area', 'meterReading.meter'])
            ->withSum('payments', 'amount')
            ->findOrFail($id);
        return Inertia::render('bills/print-single', [
            'bill' => $bill,
        ]);
    }

    public function bulkPrint(Request $request)
    {
        $ids = explode(',', $request->input('ids', ''));
        $bills = \App\Models\Bill::with(['customer.tariff', 'customer.zone', 'customer.area', 'meterReading.meter'])
            ->withSum('payments', 'amount')
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
