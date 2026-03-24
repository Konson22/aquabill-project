<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finance\Concerns\RendersFinanceOrAdminInertia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    use RendersFinanceOrAdminInertia;

    public function index(Request $request)
    {
        $query = \App\Models\Invoice::with('customer')
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('tariff')) {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('tariff_id', $request->tariff);
            });
        }

        if ($request->filled('month')) {
            $query->where('due_date', 'like', "{$request->month}%");
        }

        $invoices = $query->paginate(10)->withQueryString();

        return $this->renderFinanceOrAdmin('invoices/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'tariff', 'month']),
            'tariffs' => \App\Models\Tariff::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        \App\Models\Invoice::create([
            'invoice_number' => 'INV-'.strtoupper(\Illuminate\Support\Str::random(8)),
            'customer_id' => $validated['customer_id'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    public function show($id)
    {
        $invoice = \App\Models\Invoice::with('customer')->findOrFail($id);

        return $this->renderFinanceOrAdmin('invoices/show', [
            'invoice' => $invoice,
        ]);
    }

    public function print($id)
    {
        $invoice = \App\Models\Invoice::with(['customer.zone', 'customer.area', 'customer.tariff', 'payments'])->findOrFail($id);

        return Inertia::render('admin/invoices/print-single', [
            'invoice' => $invoice,
        ]);
    }

    public function bulkPrint(Request $request)
    {
        $ids = explode(',', $request->input('ids', ''));
        $invoices = \App\Models\Invoice::with(['customer.zone', 'customer.area', 'customer.tariff', 'payments'])
            ->whereIn('id', $ids)
            ->get();

        return Inertia::render('admin/invoices/print-multiple', [
            'invoices' => $invoices,
        ]);
    }

    public function destroy($id)
    {
        $invoice = \App\Models\Invoice::findOrFail($id);
        $invoice->delete();

        return redirect()->route('invoices')->with('success', 'Invoice deleted successfully.');
    }
}
