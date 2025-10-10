<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\Bill;
use App\Models\Customer;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with(['customer', 'bill', 'receivedBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('payments/index', [
            'payments' => $payments
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $bills = Bill::unpaid()->with('customer')->get();
        $customers = Customer::active()->get();

        return Inertia::render('payments/create', [
            'bills' => $bills,
            'customers' => $customers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'bill_id' => 'nullable|exists:bills,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,mobile_money,bank_transfer,card,cheque',
            'reference_number' => 'nullable|string',
        ]);

        $validated['received_by'] = auth()->id();

        // Create payment
        $payment = Payment::create($validated);

        // Update the related bill if specified
        if ($validated['bill_id']) {
            $bill = Bill::findOrFail($validated['bill_id']);

            // Recompute remaining balance from total paid on this bill
            $totalDue = (float) ($bill->prev_balance + $bill->total_amount);
            $totalPaid = (float) $bill->payments()->sum('amount_paid'); // includes this payment
            $newBalance = max(0, $totalDue - $totalPaid);

            $bill->current_balance = $newBalance;

            // Update status based on remaining balance
            if ($newBalance <= 0) {
                $bill->status = 'paid';
            } elseif ($totalPaid > 0 && $totalPaid < $totalDue) {
                $bill->status = 'partially_paid';
            } else {
                $bill->status = 'unpaid';
            }

            $bill->save();
        }

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Store invoice payment
     */
    public function storeInvoicePayment(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'customer_id' => 'required|exists:customers,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,mobile_money,bank_transfer,card,cheque',
            'reference_number' => 'nullable|string',
        ]);

        $validated['received_by'] = auth()->id();

        // Create payment
        $payment = Payment::create($validated);

        // Update the related invoice
        $invoice = \App\Models\Invoice::findOrFail($validated['invoice_id']);
        
        // Calculate total paid for this invoice
        $totalPaid = $invoice->payments()->sum('amount_paid');
        $remainingAmount = $invoice->amount_due - $totalPaid;
        
        // Update invoice status based on payment
        if ($remainingAmount <= 0) {
            $invoice->status = 'paid';
        }
        // Note: We don't set partially_paid as it's not in the enum
        // The invoice remains 'pending' until fully paid
        $invoice->save();

        return redirect()->back()->with('success', 'Invoice payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        $payment->load(['customer', 'bill', 'receivedBy']);

        return Inertia::render('payments/show', [
            'payment' => $payment
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        $bills = Bill::with('customer')->get();
        $customers = Customer::active()->get();

        return Inertia::render('payments/edit', [
            'payment' => $payment,
            'bills' => $bills,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'bill_id' => 'required|exists:bills,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,mobile_money,bank_transfer',
            'reference_number' => 'nullable|string',
        ]);

        $payment->update($validated);

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
