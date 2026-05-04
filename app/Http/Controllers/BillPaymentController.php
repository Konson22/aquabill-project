<?php

namespace App\Http\Controllers;

use App\Models\Bill;
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

        if ($bill->status !== 'pending') {
            abort(422, 'Payments can only be recorded while the bill status is pending.');
        }

        DB::transaction(function () use ($validated, $bill) {
            $increment = (float) $validated['amount'];
            $paidTotal = round((float) $bill->amount_paid + $increment, 2);
            $billTotal = (float) $bill->total_amount;
            $balance = max(0.0, $billTotal - $paidTotal);

            $status = match (true) {
                $paidTotal <= 0.0 => 'pending',
                $paidTotal + 0.00001 < $billTotal => 'partial',
                default => 'paid',
            };

            $bill->update([
                'amount_paid' => $paidTotal,
                'current_balance' => $balance,
                'status' => $status,
            ]);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }
}
