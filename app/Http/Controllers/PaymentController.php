<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Payment::with(['payable.customer', 'payable.home.meter', 'receiver'])
            ->latest('payment_date');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q, $type) use ($search) {
                        $q->whereHas('customer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })->orWhereHas('home', function ($q) use ($search) {
                            $q->where('address', 'like', "%{$search}%");
                        });

                        if ($type === \App\Models\Bill::class) {
                            $q->orWhereHas('meterReading.meter', function ($q) use ($search) {
                                $q->where('meter_number', 'like', "%{$search}%");
                            });
                        }
                    });
            });
        }

        if ($request->filled('area_id') && $request->area_id !== 'all') {
            $query->whereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q) use ($request) {
                $q->whereHas('home', fn($h) => $h->where('area_id', $request->area_id));
            });
        }

        if ($request->filled('zone_id') && $request->zone_id !== 'all') {
            $query->whereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q) use ($request) {
                $q->whereHas('home', fn($h) => $h->where('zone_id', $request->zone_id));
            });
        }

        if ($request->filled('month')) {
            $query->where('payment_date', 'like', "{$request->month}%");
        }

        $payments = $query->paginate(10)->withQueryString();

        $stats = [
            'total_payments' => \App\Models\Payment::count(),
            'paid' => \App\Models\Bill::where('status', 'paid')->count() + \App\Models\Invoice::where('status', 'paid')->count(),
            'unpaid' => \App\Models\Bill::whereIn('status', ['pending', 'partial_paid'])->count() + \App\Models\Invoice::where('status', 'pending')->count(),
            'overdue' => \App\Models\Bill::where('status', 'overdue')->count() + \App\Models\Invoice::where('status', 'overdue')->count(),
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

        $query = \App\Models\Payment::with(['payable.customer', 'payable.home.tariff', 'receiver'])
            ->latest('payment_date');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q, $type) use ($search) {
                        $q->whereHas('customer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })->orWhereHas('home', function ($q) use ($search) {
                            $q->where('address', 'like', "%{$search}%");
                        });

                        if ($type === \App\Models\Bill::class) {
                            $q->orWhereHas('meterReading.meter', function ($q) use ($search) {
                                $q->where('meter_number', 'like', "%{$search}%");
                            });
                        }
                    });
            });
        }

        if ($request->filled('area_id') && $request->area_id !== 'all') {
            $query->whereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q) use ($request) {
                $q->whereHas('home', fn($h) => $h->where('area_id', $request->area_id));
            });
        }

        if ($request->filled('zone_id') && $request->zone_id !== 'all') {
            $query->whereHasMorph('payable', [\App\Models\Bill::class, \App\Models\Invoice::class], function ($q) use ($request) {
                $q->whereHas('home', fn($h) => $h->where('zone_id', $request->zone_id));
            });
        }

        if ($request->filled('month')) {
            $query->where('payment_date', 'like', "{$request->month}%");
        }

        $payments = $query->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Reference', 'Amount', 'Date', 'Type', 'Tariff', 'Payable ID', 'Customer', 'Received By'];

        $callback = function () use ($payments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $totalBills = 0;
            $totalInvoices = 0;
            $tariffTotals = [];

            foreach ($payments as $payment) {
                $type = $payment->payable_type === 'App\Models\Bill' ? 'Bill' : ($payment->payable_type === 'App\Models\Invoice' ? 'Invoice' : 'Other');
                $payableId = $payment->payable ? ($type === 'Bill' ? $payment->payable->bill_number : $payment->payable->invoice_number) : 'N/A';
                $tariffName = $payment->payable && $payment->payable->home && $payment->payable->home->tariff ? $payment->payable->home->tariff->name : 'N/A';

                // Accumulate totals
                if ($type === 'Bill') {
                    $totalBills += $payment->amount;
                } elseif ($type === 'Invoice') {
                    $totalInvoices += $payment->amount;
                }

                if ($tariffName !== 'N/A') {
                    if (!isset($tariffTotals[$tariffName])) {
                        $tariffTotals[$tariffName] = 0;
                    }
                    $tariffTotals[$tariffName] += $payment->amount;
                }

                $row = [
                    $payment->id,
                    $payment->reference_number,
                    $payment->amount,
                    $payment->payment_date,
                    $type,
                    $tariffName,
                    $payableId,
                    $payment->payable && $payment->payable->customer ? $payment->payable->customer->name : 'N/A',
                    $payment->receiver ? $payment->receiver->name : 'System',
                ];

                fputcsv($file, $row);
            }

            // Summary Section
            fputcsv($file, []); // Empty row
            fputcsv($file, ['SUMMARY REPORT']);
            fputcsv($file, ['Total Bill Payments', $totalBills]);
            fputcsv($file, ['Total Invoice Payments', $totalInvoices]);
            fputcsv($file, ['Total Payments', $totalBills + $totalInvoices]);
            fputcsv($file, []); // Empty row
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
        // 1. Bills KPIs
        $billsKpisRaw = \App\Models\Bill::query()
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("SUM(CASE WHEN status IN ('paid', 'forwarded', 'partial_paid', 'balance_forwarded') THEN 1 ELSE 0 END) as paid_count")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as unpaid_count")
            // Total Billed is the sum of all fresh charges (excluding carried forward balances)
            ->selectRaw('SUM(total_amount - previous_balance) as total_billed')
            // Outstanding should only include active unpaid balances that haven't been moved to a newer bill
            ->selectRaw("SUM(CASE WHEN status NOT IN ('forwarded', 'balance_forwarded') THEN current_balance ELSE 0 END) as total_unpaid")
            ->first();

        // Calculate total payments for bills
        $billPayments = \App\Models\Payment::where('payable_type', 'App\Models\Bill')->sum('amount');

        // 2. Invoices KPIs
        $invoicesKpisRaw = \App\Models\Invoice::query()
            ->where('status', '!=', 'cancelled')
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count")
            ->selectRaw("SUM(CASE WHEN status NOT IN ('paid', 'cancelled') THEN 1 ELSE 0 END) as unpaid_count")
            ->selectRaw('SUM(amount) as total_billed')
            ->first();

        // Calculate total payments for invoices (strictly active ones)
        $invoicePayments = \App\Models\Payment::where('payable_type', 'App\Models\Invoice')
            ->whereHasMorph('payable', [\App\Models\Invoice::class], function($q) {
                $q->where('status', '!=', 'cancelled');
            })
            ->sum('amount');

        $billKpis = [
            'totalCount' => (int) $billsKpisRaw->total_count,
            'paidCount' => (int) $billsKpisRaw->paid_count,
            'unpaidCount' => (int) $billsKpisRaw->unpaid_count,
            'totalBilled' => (float) $billsKpisRaw->total_billed,
            'totalCollected' => (float) $billPayments,
            'totalUnpaid' => (float) $billsKpisRaw->total_unpaid,
        ];

        $invoiceKpis = [
            'totalCount' => (int) $invoicesKpisRaw->total_count,
            'paidCount' => (int) $invoicesKpisRaw->paid_count,
            'unpaidCount' => (int) $invoicesKpisRaw->unpaid_count,
            'totalBilled' => (float) $invoicesKpisRaw->total_billed,
            'totalCollected' => (float) $invoicePayments,
            'totalUnpaid' => (float) $invoicesKpisRaw->total_billed - (float) $invoicePayments,
        ];

        // 3. Revenue by Type
        $revenueByType = \App\Models\Payment::selectRaw('payable_type, SUM(amount) as total')
            ->groupBy('payable_type')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => class_basename($item->payable_type),
                    'value' => (float) $item->total,
                ];
            });

        // 4. Water Bill Tariff Performance (Excluding Invoices)
        $tariffRevenue = \App\Models\Tariff::all()->map(function ($tariff) {
            // Stats from Bills only
            $billStats = \App\Models\Bill::whereHas('home', fn($q) => $q->where('tariff_id', $tariff->id))
                ->selectRaw('SUM(total_amount - previous_balance) as billed')
                ->selectRaw("SUM(CASE WHEN status NOT IN ('forwarded', 'balance_forwarded') THEN current_balance ELSE 0 END) as unpaid")
                ->first();

            // Total Collected for this tariff (from Bills only)
            $collected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                ->whereHasMorph('payable', [\App\Models\Bill::class], function ($query) use ($tariff) {
                    $query->whereHas('home', fn($h) => $h->where('tariff_id', $tariff->id));
                })->sum('amount');

            return [
                'name' => $tariff->name,
                'total_billed' => (float) ($billStats->billed ?? 0),
                'collected' => (float) $collected,
                'outstanding' => (float) ($billStats->unpaid ?? 0),
            ];
        });

        // 5. Zone Performance
        $zoneRevenue = \App\Models\Zone::all()->map(function ($zone) {
            // Stats from Bills only
            $billStats = \App\Models\Bill::whereHas('home', fn($q) => $q->where('zone_id', $zone->id))
                ->selectRaw('SUM(total_amount - previous_balance) as billed')
                ->selectRaw("SUM(CASE WHEN status NOT IN ('forwarded', 'balance_forwarded') THEN current_balance ELSE 0 END) as unpaid")
                ->first();

            // Total Collected for this zone (from Bills only)
            $collected = \App\Models\Payment::where('payable_type', \App\Models\Bill::class)
                ->whereHasMorph('payable', [\App\Models\Bill::class], function ($query) use ($zone) {
                    $query->whereHas('home', fn($h) => $h->where('zone_id', $zone->id));
                })->sum('amount');

            return [
                'name' => $zone->name,
                'total_billed' => (float) ($billStats->billed ?? 0),
                'collected' => (float) $collected,
                'outstanding' => (float) ($billStats->unpaid ?? 0),
            ];
        });

        // 5. Monthly Performance Trend (Last 12 months - Paid vs Unpaid)
        $monthlyTrend = \App\Models\Bill::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('SUM(total_amount - current_balance) as paid')
            ->selectRaw('SUM(current_balance) as unpaid')
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                 return [
                     'month' => $item->month,
                     'paid' => (float) $item->paid,
                     'unpaid' => (float) $item->unpaid,
                 ];
            });

        return Inertia::render('payments/report', [
            'revenueByType' => $revenueByType,
            'tariffRevenue' => $tariffRevenue,
            'zoneRevenue' => $zoneRevenue,
            'monthlyTrend' => $monthlyTrend,
            'billKpis' => $billKpis,
            'invoiceKpis' => $invoiceKpis,
            'totalRevenue' => \App\Models\Payment::sum('amount'),
        ]);
    }

    public function show($id)
    {
        $payment = \App\Models\Payment::with(['payable', 'receiver'])->findOrFail($id);
        
        // If the payable is a Bill, we might want to load the customer or home associated with it
        if ($payment->payable_type === 'App\Models\Bill') {
            $payment->load(['payable.customer', 'payable.meterReading.meter', 'payable.home', 'payable.payments']);
        } else if ($payment->payable_type === 'App\Models\Invoice') {
             $payment->load('payable.customer');
        }

        return Inertia::render('payments/show', [
            'payment' => $payment
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
            'reference_number' => ['nullable', 'string', 'max:255', 'unique:payments,reference_number'],
            'notes' => ['nullable', 'string'],
        ]);

        $payable = null;
        $currentBalance = 0;

        if (!empty($validated['bill_id'])) {
            $payable = \App\Models\Bill::findOrFail($validated['bill_id']);
            $currentBalance = $payable->current_balance;
        } elseif (!empty($validated['invoice_id'])) {
            $payable = \App\Models\Invoice::findOrFail($validated['invoice_id']);
            // Invoices don't have a current_balance column, calculate it
            $paid = $payable->payments()->sum('amount');
            $currentBalance = $payable->amount - $paid;
        }

        if ($validated['amount'] > $currentBalance) {
             return back()->withErrors(['amount' => 'Amount cannot exceed the current balance of ' . $currentBalance]);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $payable, $currentBalance) {
            $payment = $payable->payments()->create([
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'notes' => $validated['notes'],
                'received_by' => \Illuminate\Support\Facades\Auth::id(),
                'balance' => $currentBalance - $validated['amount'], // Balance AFTER payment
            ]);

            if ($payable instanceof \App\Models\Bill) {
                $payable->current_balance -= $validated['amount'];
                
                if ($payable->current_balance <= 0) {
                    $payable->status = 'paid';
                    $payable->current_balance = 0;
                } else {
                    $payable->status = 'partial_paid';
                }
                $payable->save();
            } elseif ($payable instanceof \App\Models\Invoice) {
                // Invoice status update
                if (($currentBalance - $validated['amount']) <= 0) {
                    $payable->status = 'paid';
                } else {
                     // Invoices enum is ['pending', 'paid', 'overdue', 'cancelled']
                     // Does not have 'partial_paid' or 'partial'. We keeping it 'pending' or 'overdue' if partial?
                     // Or assume 'pending' covers partial.
                     // Ideally we add 'partial' to enum, but without migration let's stick to 'pending' if not fully paid.
                }
                $payable->save();
            }
        });

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }
}
