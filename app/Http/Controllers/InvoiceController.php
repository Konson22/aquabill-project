<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Meter;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['customer', 'meter', 'payments']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('first_name', 'like', "%{$search}%")
                                   ->orWhere('last_name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Apply status filter
        if ($request->filled('status')) {
            $status = $request->get('status');
            if ($status === 'overdue') {
                $query->where('status', '!=', 'paid')
                      ->where('status', '!=', 'cancelled')
                      ->where('due_date', '<', now());
            } else {
                $query->where('status', $status);
            }
        }

        // Apply date filter
        if ($request->filled('date')) {
            $dateFilter = $request->get('date');
            $now = now();
            
            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('issue_date', $now->toDateString());
                    break;
                case 'week':
                    $query->whereBetween('issue_date', [$now->startOfWeek(), $now->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('issue_date', $now->month)
                          ->whereYear('issue_date', $now->year);
                    break;
                case 'quarter':
                    $query->whereBetween('issue_date', [$now->startOfQuarter(), $now->endOfQuarter()]);
                    break;
                case 'year':
                    $query->whereYear('issue_date', $now->year);
                    break;
            }
        }

        $invoices = $query->latest()->paginate(20);
        
        // Get customers and meters for the form
        $customers = Customer::active()->get();
        $meters = Meter::active()->get();

        return Inertia::render('finance/invoices/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status', 'date']),
            'customers' => $customers,
            'meters' => $meters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::active()->get();
        $meters = Meter::active()->get();

        return Inertia::render('finance/invoices/create', [
            'customers' => $customers,
            'meters' => $meters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'meter_id' => 'nullable|exists:meters,id',
            'reason' => 'nullable|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'amount_due' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        Invoice::create($validated);

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'meter', 'payments']);

        return Inertia::render('finance/invoices/show', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Print the specified invoice.
     */
    public function print(Invoice $invoice)
    {
        $invoice->load(['customer', 'meter', 'payments']);

        return Inertia::render('finance/invoices/print', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Print multiple invoices.
     */
    public function printMultiple(Request $request)
    {
        $ids = $request->get('ids');
        
        if (!$ids) {
            return redirect()->route('invoices.index')->with('error', 'No invoices selected for printing.');
        }

        $invoiceIds = explode(',', $ids);
        $invoices = Invoice::with(['customer', 'meter', 'payments'])
            ->whereIn('id', $invoiceIds)
            ->get();

        if ($invoices->isEmpty()) {
            return redirect()->route('invoices.index')->with('error', 'No invoices found for printing.');
        }

        return Inertia::render('finance/invoices/print-multiple', [
            'invoices' => $invoices
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice)
    {
        $customers = Customer::active()->get();
        $meters = Meter::active()->get();

        return Inertia::render('finance/invoices/edit', [
            'invoice' => $invoice,
            'customers' => $customers,
            'meters' => $meters,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'meter_id' => 'nullable|exists:meters,id',
            'reason' => 'nullable|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'amount_due' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $invoice->update($validated);

        return redirect()->route('invoices.index')->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }
}
