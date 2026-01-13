<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Invoice::with(['customer', 'home', 'payments'])
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                 $q->where('invoice_number', 'like', "%{$search}%")
                   ->orWhereHas('customer', function($q2) use ($search) {
                       $q2->where('name', 'like', "%{$search}%");
                   });
            });
        }

        if ($request->filled('tariff')) {
            $query->whereHas('home', function($q) use ($request) {
                $q->where('tariff_id', $request->tariff);
            });
        }

        if ($request->filled('month')) {
            $query->where('due_date', 'like', "{$request->month}%");
        }

        $invoices = $query->paginate(10)->withQueryString();

        return Inertia::render('invoices/index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'tariff', 'month']),
            'tariffs' => \App\Models\Tariff::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'home_id' => 'required|exists:homes,id',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'type' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $home = \App\Models\Home::findOrFail($validated['home_id']);

        \App\Models\Invoice::create([
            'invoice_number' => 'INV-' . strtoupper(\Illuminate\Support\Str::random(8)),
            'customer_id' => $home->customer_id,
            'home_id' => $home->id,
            'type' => $validated['type'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'status' => 'unpaid',
        ]);

        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    public function show($id)
    {
        $invoice = \App\Models\Invoice::with(['customer', 'home', 'payments'])->findOrFail($id);
        return Inertia::render('invoices/show', [
            'invoice' => $invoice
        ]);
    }

    public function print($id)
    {
        $invoice = \App\Models\Invoice::with(['customer', 'home.zone', 'home.area', 'home.tariff', 'payments'])->findOrFail($id);

        return Inertia::render('invoices/print-single', [
            'invoice' => $invoice,
        ]);
    }

    public function bulkPrint(Request $request)
    {
        $ids = explode(',', $request->input('ids', ''));
        $invoices = \App\Models\Invoice::with(['customer', 'home.zone', 'home.area', 'home.tariff', 'payments'])
            ->whereIn('id', $ids)
            ->get();
            
        return Inertia::render('invoices/print-multiple', [
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
