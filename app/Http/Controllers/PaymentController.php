<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bill;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $paymentQuery = Payment::with([
            'payable.customer',
            'payable.customer.zone',
            'payable.customer.area',
            'payable.customer.meter',
            'receivedBy',
        ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHasMorph('payable', [Bill::class], function ($query, $type) use ($search) {
                        $query->whereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('address', 'like', "%{$search}%"))
                            ->orWhereHas('meterReading.meter', fn($m) => $m->where('meter_number', 'like', "%{$search}%"));
                    })
                    ->orWhereHasMorph('payable', [Invoice::class], function ($query, $type) use ($search) {
                        $query->whereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('address', 'like', "%{$search}%"));
                    });
            })
            ->when($request->filled('area_id') && $request->area_id !== 'all', function ($q) use ($request) {
                $q->whereHasMorph('payable', [Bill::class, Invoice::class], function ($query) use ($request) {
                    $query->whereHas('customer', fn($c) => $c->where('area_id', $request->area_id));
                });
            })
            ->when($request->filled('zone_id') && $request->zone_id !== 'all', function ($q) use ($request) {
                $q->whereHasMorph('payable', [Bill::class, Invoice::class], function ($query) use ($request) {
                    $query->whereHas('customer', fn($c) => $c->where('zone_id', $request->zone_id));
                });
            })
            ->when($request->filled('month'), fn($q) => $q->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$request->month]))
            ->orderByDesc('payment_date');

        $payments = $paymentQuery->paginate(10);

        $stats = [
            'total_payments' => Payment::count(),
            'paid' => Bill::where('status', 'fully paid')->count() + Invoice::where('status', 'paid')->count(),
            'unpaid' => Bill::whereIn('status', ['pending', 'partial paid'])->count() + Invoice::whereIn('status', ['pending'])->count(),
            'overdue' => Bill::whereIn('status', ['pending', 'partial paid'])->where('due_date', '<', now())->count(),
        ];

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'area_id', 'zone_id', 'month']),
            'zones' => \App\Models\Zone::all(),
            'areas' => \App\Models\Area::all(),
            'stats' => $stats,
        ]);
    }

    public function export(Request $request)
    {
        $filename = 'payments-export-' . date('Y-m-d') . '.csv';

        $payments = Payment::with(['payable.customer', 'payable.customer.tariff', 'receivedBy'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHasMorph('payable', [Bill::class, Invoice::class], function ($query) use ($search) {
                        $query->whereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%")->orWhere('address', 'like', "%{$search}%"));
                    });
            })
            ->when($request->filled('area_id') && $request->area_id !== 'all', function ($q) use ($request) {
                $q->whereHasMorph('payable', [Bill::class, Invoice::class], function ($query) use ($request) {
                    $query->whereHas('customer', fn($c) => $c->where('area_id', $request->area_id));
                });
            })
            ->when($request->filled('zone_id') && $request->zone_id !== 'all', function ($q) use ($request) {
                $q->whereHasMorph('payable', [Bill::class, Invoice::class], function ($query) use ($request) {
                    $query->whereHas('customer', fn($c) => $c->where('zone_id', $request->zone_id));
                });
            })
            ->when($request->filled('month'), fn($q) => $q->whereRaw("DATE_FORMAT(payment_date, '%Y-%m') = ?", [$request->month]))
            ->orderByDesc('payment_date')->get();

        $rows = collect();
        foreach ($payments as $payment) {
            $payable = $payment->payable;
            $type = $payable instanceof Bill ? 'Bill' : 'Invoice';
            $payableId = $payable instanceof Bill ? $payable->bill_number : $payable->invoice_number;
            
            $rows->push((object)[
                'type' => $type,
                'payable_id' => $payableId ?? 'N/A',
                'tariff' => $payable->customer?->tariff?->name ?? 'N/A',
                'customer' => $payable->customer?->name ?? 'N/A',
                'payment' => $payment,
            ]);
        }

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Reference', 'Amount', 'Date', 'Type', 'Tariff', 'Payable ID', 'Customer', 'Received By'];
        $totalBills = 0;
        $totalInvoices = 0;
        $tariffTotals = [];

        $callback = function () use ($rows, $columns, &$totalBills, &$totalInvoices, &$tariffTotals) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($rows as $row) {
                $p = $row->payment;
                if ($row->type === 'Bill') {
                    $totalBills += (float) $p->amount;
                } else {
                    $totalInvoices += (float) $p->amount;
                }
                if ($row->tariff !== 'N/A') {
                    $tariffTotals[$row->tariff] = ($tariffTotals[$row->tariff] ?? 0) + (float) $p->amount;
                }
                fputcsv($file, [
                    $p->id,
                    $p->reference_number ?? '',
                    $p->amount ?? 0,
                    $p->payment_date?->format('Y-m-d') ?? '',
                    $row->type,
                    $row->tariff,
                    $row->payable_id,
                    $row->customer,
                    $p->receivedBy?->name ?? 'System',
                ]);
            }

            fputcsv($file, []);
            fputcsv($file, ['SUMMARY REPORT']);
            fputcsv($file, ['Total Bill Payments', $totalBills]);
            fputcsv($file, ['Total Invoice Payments', $totalInvoices]);
            fputcsv($file, ['Total Payments', $totalBills + $totalInvoices]);
            fputcsv($file, []);
            fputcsv($file, ['TARIFF UPDATE']);
            foreach ($tariffTotals as $tariff => $amount) {
                fputcsv($file, [$tariff, $amount]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function report(Request $request)
    {
        // Bills KPIs: totalBilled = sum of bill amount, totalCollected = sum of payments, totalUnpaid = totalBilled - totalCollected
        $billsKpisRaw = Bill::query()
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("SUM(CASE WHEN status IN ('fully paid', 'forwarded', 'partial paid', 'balance forwarded') THEN 1 ELSE 0 END) as paid_count")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as unpaid_count")
            ->selectRaw('COALESCE(SUM(amount), 0) as total_billed')
            ->first();

        $totalBilledBills = (float) $billsKpisRaw->total_billed;
        $billPaymentsTotal = (float) Payment::where('payable_type', Bill::class)->sum('amount');
        $billsTotalUnpaid = $totalBilledBills - $billPaymentsTotal;

        // Invoices KPIs
        $invoicesKpisRaw = Invoice::query()
            ->where('status', '!=', 'cancelled')
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count")
            ->selectRaw("SUM(CASE WHEN status NOT IN ('paid', 'cancelled') THEN 1 ELSE 0 END) as unpaid_count")
            ->selectRaw('COALESCE(SUM(amount), 0) as total_billed')
            ->first();

        $invoicePaymentsTotal = (float) Payment::where('payable_type', Invoice::class)->sum('amount');

        $billKpis = [
            'totalCount' => (int) $billsKpisRaw->total_count,
            'paidCount' => (int) $billsKpisRaw->paid_count,
            'unpaidCount' => (int) $billsKpisRaw->unpaid_count,
            'totalBilled' => $totalBilledBills,
            'totalCollected' => $billPaymentsTotal,
            'totalUnpaid' => $billsTotalUnpaid,
        ];

        $invoiceKpis = [
            'totalCount' => (int) $invoicesKpisRaw->total_count,
            'paidCount' => (int) $invoicesKpisRaw->paid_count,
            'unpaidCount' => (int) $invoicesKpisRaw->unpaid_count,
            'totalBilled' => (float) $invoicesKpisRaw->total_billed,
            'totalCollected' => $invoicePaymentsTotal,
            'totalUnpaid' => (float) ($invoicesKpisRaw->total_billed ?? 0) - $invoicePaymentsTotal,
        ];

        $revenueByType = collect([
            ['name' => 'Bill', 'value' => $billPaymentsTotal],
            ['name' => 'Invoice', 'value' => $invoicePaymentsTotal],
        ]);

        // Tariff revenue: single grouped query per metric (replaces N+1 per tariff)
        $tariffBilled = Bill::query()
            ->join('customers', 'bills.customer_id', '=', 'customers.id')
            ->selectRaw('COALESCE(customers.tariff_id, -1) as tariff_id')
            ->selectRaw('COALESCE(SUM(bills.amount), 0) as total_billed')
            ->groupBy('customers.tariff_id')
            ->get()
            ->keyBy(fn ($r) => $r->tariff_id === -1 ? 'null' : (string) $r->tariff_id);

        $tariffCollected = DB::table('payments')
            ->join('bills', fn ($j) => $j->on('payments.payable_id', '=', 'bills.id')->where('payments.payable_type', '=', Bill::class))
            ->join('customers', 'bills.customer_id', '=', 'customers.id')
            ->selectRaw('COALESCE(customers.tariff_id, -1) as tariff_id')
            ->selectRaw('COALESCE(SUM(payments.amount), 0) as collected')
            ->groupBy('customers.tariff_id')
            ->get()
            ->keyBy(fn ($r) => $r->tariff_id === -1 ? 'null' : (string) $r->tariff_id);

        $tariffs = \App\Models\Tariff::all();
        $tariffRevenue = $tariffs->map(function ($tariff) use ($tariffBilled, $tariffCollected) {
            $key = (string) $tariff->id;
            $totalBilled = (float) (($tariffBilled[$key] ?? null)?->total_billed ?? 0);
            $collected = (float) (($tariffCollected[$key] ?? null)?->collected ?? 0);
            return [
                'id' => $tariff->id,
                'name' => $tariff->name,
                'total_billed' => round($totalBilled, 2),
                'collected' => round($collected, 2),
                'outstanding' => (float) max(0, round($totalBilled - $collected, 2)),
            ];
        });

        $nullBilled = $tariffBilled['null'] ?? null;
        $nullCollected = $tariffCollected['null'] ?? null;
        if ($nullBilled && (float) $nullBilled->total_billed > 0) {
            $tb = (float) $nullBilled->total_billed;
            $tc = (float) ($nullCollected->collected ?? 0);
            $tariffRevenue = $tariffRevenue->push([
                'id' => 0,
                'name' => 'Unassigned',
                'total_billed' => round($tb, 2),
                'collected' => round($tc, 2),
                'outstanding' => (float) max(0, round($tb - $tc, 2)),
            ]);
        }

        // Zone revenue: 2 grouped queries (replaces N+1 per zone + Bill balance accessor)
        $zoneBilled = DB::table('zones')
            ->leftJoin('customers', 'zones.id', '=', 'customers.zone_id')
            ->leftJoin('bills', 'customers.id', '=', 'bills.customer_id')
            ->select('zones.id', 'zones.name')
            ->selectRaw('COALESCE(SUM(bills.amount + bills.previous_balance), 0) as total_billed')
            ->groupBy('zones.id', 'zones.name')
            ->get()
            ->keyBy('id');

        $zoneCollected = DB::table('payments')
            ->join('bills', fn ($j) => $j->on('payments.payable_id', '=', 'bills.id')->where('payments.payable_type', '=', Bill::class))
            ->join('customers', 'bills.customer_id', '=', 'customers.id')
            ->select('customers.zone_id as id')
            ->selectRaw('COALESCE(SUM(payments.amount), 0) as collected')
            ->groupBy('customers.zone_id')
            ->get()
            ->keyBy('id');

        $zoneRevenue = $zoneBilled->map(function ($row) use ($zoneCollected) {
            $totalBilled = (float) $row->total_billed;
            $collected = (float) (($zoneCollected[$row->id] ?? null)?->collected ?? 0);
            return [
                'name' => $row->name,
                'total_billed' => $totalBilled,
                'collected' => $collected,
                'outstanding' => (float) max(0, $totalBilled - $collected),
            ];
        })->values();

        // Monthly trend: 3 queries total instead of 3 per month
        $monthlyPayments = Payment::query()
            ->selectRaw("DATE_FORMAT(payment_date, '%Y-%m') as month")
            ->selectRaw('SUM(amount) as paid')
            ->where('payment_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monthlyBilledBills = Bill::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('SUM(amount + previous_balance) as billed')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyBilledInvoices = Invoice::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('COALESCE(SUM(amount), 0) as billed')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $months = collect();
        for ($i = 0; $i < 12; $i++) {
            $m = now()->subMonths(11 - $i)->format('Y-m');
            $billed = (float) (($monthlyBilledBills[$m] ?? null)?->billed ?? 0) + (float) (($monthlyBilledInvoices[$m] ?? null)?->billed ?? 0);
            $paid = (float) (($monthlyPayments[$m] ?? null)?->paid ?? 0);
            $months->push([
                'month' => $m,
                'paid' => $paid,
                'unpaid' => (float) max(0, $billed - $paid),
            ]);
        }
        $monthlyTrend = $months;

        return Inertia::render('payments/report', [
            'revenueByType' => $revenueByType,
            'tariffRevenue' => $tariffRevenue,
            'zoneRevenue' => $zoneRevenue,
            'monthlyTrend' => $monthlyTrend,
            'billKpis' => $billKpis,
            'invoiceKpis' => $invoiceKpis,
            'totalRevenue' => $billPaymentsTotal + $invoicePaymentsTotal,
        ]);
    }

    public function show($id)
    {
        $payment = Payment::with(['payable.customer', 'payable.customer.zone', 'payable.customer.area', 'receivedBy'])->findOrFail($id);
        
        $payable = $payment->payable;
        if ($payable instanceof Bill) {
            $payable->load(['meterReading.meter']);
        }

        return Inertia::render('payments/show', [
            'payment' => $payment,
            'payable' => $payable,
            'payment_type' => $payable instanceof Bill ? 'bill' : 'invoice',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bill_id' => ['nullable', 'exists:bills,id', 'required_without:invoice_id'],
            'invoice_id' => ['nullable', 'exists:invoices,id', 'required_without:bill_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,card,bank_transfer,mobile_money,check,other'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        if (!empty($validated['reference_number'])) {
            if (Payment::where('reference_number', $validated['reference_number'])->exists()) {
                return back()->withErrors(['reference_number' => 'Reference number already exists.']);
            }
        }

        DB::beginTransaction();
        try {
            if (!empty($validated['bill_id'])) {
                $bill = Bill::findOrFail($validated['bill_id']);
                $currentBalance = (float) $bill->balance;
                if ($validated['amount'] > $currentBalance) {
                    return back()->withErrors(['amount' => 'Amount cannot exceed the current balance of ' . $currentBalance]);
                }

                $amountPaidBefore = (float) $bill->amount_paid;
                $newAmountPaid = $amountPaidBefore + (float) $validated['amount'];
                $newBalanceAfter = (float) $bill->total_amount - $newAmountPaid;

                $payment = Payment::create([
                    'payable_type' => Bill::class,
                    'payable_id' => $bill->id,
                    'amount' => $validated['amount'],
                    'payable_total' => (float) $bill->total_amount,
                    'amount_paid' => $newAmountPaid,
                    'balance_after' => $newBalanceAfter,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'reference_number' => $validated['reference_number'],
                    'received_by' => auth()->id(),
                    'notes' => $validated['notes'],
                ]);

                $bill->update([
                    'status' => round($newBalanceAfter, 2) <= 0 ? 'fully paid' : 'partial paid',
                ]);
            } else {
                $invoice = Invoice::findOrFail($validated['invoice_id']);
                $currentBalance = (float) $invoice->balance;
                if ($validated['amount'] > $currentBalance) {
                    return back()->withErrors(['amount' => 'Amount cannot exceed the current balance of ' . $currentBalance]);
                }

                $amountPaidBefore = (float) $invoice->amount_paid;
                $newAmountPaid = $amountPaidBefore + (float) $validated['amount'];
                $newBalanceAfter = (float) $invoice->amount - $newAmountPaid;

                $payment = Payment::create([
                    'payable_type' => Invoice::class,
                    'payable_id' => $invoice->id,
                    'amount' => $validated['amount'],
                    'payable_total' => (float) $invoice->amount,
                    'amount_paid' => $newAmountPaid,
                    'balance_after' => $newBalanceAfter,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'reference_number' => $validated['reference_number'],
                    'received_by' => auth()->id(),
                    'notes' => $validated['notes'],
                ]);

                $invoice->update([
                    'status' => round($newBalanceAfter, 2) <= 0 ? 'paid' : 'pending',
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record payment: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payable = $payment->payable;

        DB::beginTransaction();
        try {
            $payment->delete();

            // Recalculate status for the payable
            if ($payable instanceof Bill) {
                $balance = (float) $payable->balance;
                $payable->update([
                    'status' => round($balance, 2) <= 0 ? 'fully paid' : (round($balance, 2) < (float) $payable->total_amount ? 'partial paid' : 'pending'),
                ]);
            } elseif ($payable instanceof Invoice) {
                $balance = (float) $payable->balance;
                $payable->update([
                    'status' => round($balance, 2) <= 0 ? 'paid' : 'pending',
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete payment: ' . $e->getMessage()]);
        }
    }
}
