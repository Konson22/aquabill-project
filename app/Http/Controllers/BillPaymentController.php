<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BillPaymentController extends Controller
{
    public function store(Request $request, Bill $bill)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => [
                'required',
                Rule::in(['cash', 'bank', 'mobile_money', 'cheque']),
            ],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $bill) {
            Payment::create([
                'customer_id' => $bill->customer_id,
                'bill_id' => $bill->id,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'received_by' => auth()->id(),
                'notes' => $validated['notes'] ?? "Payment for bill #{$bill->id}",
            ]);

            $paidTotal = (float) Payment::query()
                ->where('bill_id', $bill->id)
                ->sum('amount');

            $billTotal = (float) $bill->total_amount;

            $status = match (true) {
                $paidTotal <= 0.0 => 'unpaid',
                $paidTotal + 0.00001 < $billTotal => 'partial',
                default => 'paid',
            };

            $bill->update(['status' => $status]);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }
}
