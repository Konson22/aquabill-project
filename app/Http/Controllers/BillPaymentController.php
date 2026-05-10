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
            $billTotal = (float) $bill->total_amount;
            $alreadyPaid = round((float) $bill->payments()->sum('amount'), 2);
            $balanceAfter = max(0.0, round($billTotal - $alreadyPaid - $increment, 2));

            $bill->payments()->create([
                'amount' => $increment,
                'current_balance' => $balanceAfter,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'recorded_by' => auth()->id(),
            ]);

            $bill->unsetRelation('payments');
            $bill->loadSum('payments', 'amount');

            $paidTotal = round($bill->paidTotalFloat(), 2);
            $billTotal = (float) $bill->total_amount;

            $status = match (true) {
                $paidTotal <= 0.0 => 'pending',
                $paidTotal + 0.00001 < $billTotal => 'partial',
                default => 'paid',
            };

            $bill->update([
                'status' => $status,
            ]);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }
}
