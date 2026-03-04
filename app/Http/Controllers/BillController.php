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

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'fully paid') {
                $query->fullyPaid();
            } elseif (in_array($request->status, ['pending', 'partial paid'])) {
                $query->unpaid();
            }
        }

        if ($request->filled('month')) {
            $query->whereRaw("DATE_FORMAT(bills.created_at, '%Y-%m') = ?", [$request->month]);
        }

        if ($request->filled('tariff_id') && $request->tariff_id !== 'all') {
            $query->whereHas('customer', fn ($q) => $q->where('tariff_id', $request->tariff_id));
        }

        $bills = $query->latest()->paginate(10)->withQueryString();
        return Inertia::render('bills/index', [
            'bills' => $bills,
            'filters' => $request->only(['search', 'status', 'month', 'tariff_id']),
            'tariffs' => \App\Models\Tariff::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function printingList()
    {
        $bills = \App\Models\Bill::with(['customer.zone', 'customer.meter', 'meterReading'])
            ->unpaid()
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
        $asExcel = $request->input('format') === 'xlsx';

        if ($tariffId === 'all') $tariffId = null;
        if ($zoneId === 'all') $zoneId = null;

        $filename = 'billing_report_' . date('Y-m-d') . ($asExcel ? '.xls' : '.csv');
        $headers = $asExcel ? ['Content-Type' => 'application/vnd.ms-excel; charset=UTF-8'] : [];

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
            $totalBilled = (clone $kpiQuery)->selectRaw('SUM(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) as total')->value('total') ?? 0;
            $totalCollected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                ->whereIn('payable_id', $billIds)
                ->sum('amount');
            $allBillsCount = (clone $kpiQuery)->count();
            $paidBillsCount = (clone $kpiQuery)->fullyPaid()->count();
            $unpaidBillsCount = (clone $kpiQuery)->unpaid()->count();
            
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
                ->selectRaw("DATE_FORMAT(bills.created_at, '%Y-%m') as month, SUM(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance) as billed")
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
                ->selectRaw('COALESCE(SUM(bills.water_consumption_volume * bills.tariff + bills.fix_charges + bills.previous_balance), 0) as billed')
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
        }, $filename, $headers);
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
