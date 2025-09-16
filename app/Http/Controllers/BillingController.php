<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bill;

class BillingController extends Controller
{
    /**
     * Billing index: list all bills with basic filters.
     */
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string',
            'status' => 'nullable|in:unpaid,paid,overdue,partially_paid,balance_forwarded',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $query = Bill::with(['customer.category', 'meter', 'payment', 'reading']);

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($cq) use ($search) {
                    $cq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('account_number', 'like', "%{$search}%");
                })->orWhereHas('meter', function ($mq) use ($search) {
                    $mq->where('serial', 'like', "%{$search}%");
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Date range filter (by billing_period_end)
        if ($request->filled('date_from')) {
            $query->whereDate('billing_period_end', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('billing_period_end', '<=', $request->date_to);
        }

        $bills = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('billing/index', [
            'bills' => $bills,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Dedicated range filter page for bills.
     */
    public function range(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'status' => 'nullable|in:unpaid,paid,overdue,partially_paid,balance_forwarded',
            'search' => 'nullable|string',
        ]);

        $query = Bill::with(['customer.category', 'meter', 'reading', 'payments']);

        if ($request->filled('date_from')) {
            $query->whereDate('billing_period_end', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('billing_period_end', '<=', $request->date_to);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($cq) use ($search) {
                    $cq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('account_number', 'like', "%{$search}%");
                })->orWhereHas('meter', function ($mq) use ($search) {
                    $mq->where('serial', 'like', "%{$search}%");
                });
            });
        }

        $bills = $query->orderBy('billing_period_end', 'desc')->paginate(15)->withQueryString();

        // Aggregate stats for the selected range
        $stats = [
            'total' => $bills->total(),
            'totalAmount' => (float) $query->clone()->sum('total_amount'),
            'outstanding' => (float) $query->clone()->sum('current_balance'),
            'paid' => (int) $query->clone()->where('status', 'paid')->count(),
            'overdue' => (int) $query->clone()->where('status', 'overdue')->count(),
        ];

        return Inertia::render('billing/range', [
            'bills' => $bills,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'stats' => $stats,
        ]);
    }

    /**
     * Export filtered bills as CSV (Excel-compatible)
     */
    public function exportRange(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'status' => 'nullable|in:unpaid,paid,overdue,partially_paid,balance_forwarded',
            'search' => 'nullable|string',
        ]);

        $query = Bill::with(['customer', 'meter', 'generatedBy']);

        if ($request->filled('date_from')) {
            $query->whereDate('billing_period_end', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('billing_period_end', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($cq) use ($search) {
                    $cq->where('first_name', 'like', "%{$search}%")
                       ->orWhere('last_name', 'like', "%{$search}%")
                       ->orWhere('account_number', 'like', "%{$search}%");
                })->orWhereHas('meter', function ($mq) use ($search) {
                    $mq->where('serial', 'like', "%{$search}%");
                });
            });
        }

        $filename = 'billing_range_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $columns = [
            'Bill ID',
            'Customer',
            'Account',
            'Customer Type',
            'Meter',
            'Period Start',
            'Period End',
            'Prev Reading',
            'Current Reading',
            'Consumption',
            'Fixed Charges',
            'Tariff',
            'Billing Officer',
            'Outstanding',
            'Prev Balance',
            'Volumetric Charge',
            'Illegal Connection',
            'Illegal Connection*Tariff',
            'Total',
            'Amount Paid',
            'Payment Date',
            'Status',
        ];

        $callback = function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, $columns);
            $query->orderBy('billing_period_end', 'desc')->chunk(500, function ($rows) use ($handle) {
                foreach ($rows as $b) {
                    $customerName = $b->customer ? ($b->customer->first_name . ' ' . $b->customer->last_name) : '';
                    $account = $b->customer->account_number ?? '';
                    $customerType = $b->customer->category->type_id ?? '';
                    $meterSerial = $b->meter->serial ?? '';
                    $prevReading = optional($b->reading)->previous ?? '';
                    $currentReading = optional($b->reading)->value ?? '';
                    $consumption = (float) ($b->consumption ?? 0);
                    $fixedCharge = (float) ($b->fixed_charge ?? 0);
                    $tariff = (float) ($b->unit_price ?? 0);
                    $billingOfficer = optional($b->generatedBy)->name ?? '';
                    $outstanding = (float) ($b->current_balance ?? 0);
                    $prevBalance = (float) ($b->prev_balance ?? 0);
                    $volumetricCharge = $consumption * $tariff;
                    $illegalConnection = (float) (optional($b->reading)->illigal_connection ?? 0);
                    $illegalConnectionTariff = $illegalConnection * $tariff;
                    $total = (float) ($b->total_amount ?? 0);
                    $amountPaid = (float) ($b->payments?->sum('amount_paid') ?? 0);
                    $latestPayment = optional($b->payments?->sortByDesc('payment_date')->first())->payment_date;
                    fputcsv($handle, [
                        $b->id,
                        $customerName,
                        $account,
                        $customerType,
                        $meterSerial,
                        $b->billing_period_start,
                        $b->billing_period_end,
                        $prevReading,
                        $currentReading,
                        $consumption,
                        $fixedCharge,
                        $tariff,
                        $billingOfficer,
                        $outstanding,
                        $prevBalance,
                        $volumetricCharge,
                        $illegalConnection,
                        $illegalConnectionTariff,
                        $total,
                        $amountPaid,
                        $latestPayment,
                        $b->status,
                    ]);
                }
            });
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
    /**
     * Show a single bill details page.
     */
    public function show(Bill $bill)
    {
        $bill->load([
            'customer.category', 
            'meter', 
            'reading', 
            'generatedBy', 
            'payments.receivedBy'
        ]);

        return Inertia::render('billing/show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Print preview page for a bill
     */
    public function print(Bill $bill)
    {
        $bill->load(['customer', 'customer.category', 'meter', 'reading', 'generatedBy']);

        return Inertia::render('billing/print', [
            'bill' => $bill,
        ]);
    }

    /**
     * Print preview page for multiple bills
     */
    public function printMultiple(Request $request)
    {
        $request->validate([
            'ids' => 'required|string',
        ]);

        $ids = collect(explode(',', $request->get('ids')))
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $bills = Bill::with(['customer.category', 'meter', 'reading', 'generatedBy'])
            ->whereIn('id', $ids)
            ->orderBy('billing_period_end', 'desc')
            ->get();

        return Inertia::render('billing/print-multiple', [
            'bills' => $bills,
        ]);
    }
}


