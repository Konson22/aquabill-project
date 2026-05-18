<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBillPaymentRequest;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Station;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BillPaymentController extends Controller
{
    public function store(Request $request, Bill $bill): RedirectResponse
    {
        $this->normalizeStationRequest($request);

        $stationRules = Station::query()->exists()
            ? ['required', 'integer', Rule::exists('stations', 'id')]
            : ['nullable', 'integer', Rule::exists('stations', 'id')];

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => [
                'required',
                Rule::in(['cash', 'bank', 'mobile_money', 'cheque']),
            ],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'station_id' => $stationRules,
        ]);

        if ($bill->status !== 'pending') {
            abort(422, 'Payments can only be recorded while the bill status is pending.');
        }

        DB::transaction(function () use ($validated, $bill): void {
            $bill->payments()->create([
                'amount' => (float) $validated['amount'],
                'current_balance' => 0,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'recorded_by' => auth()->id(),
                'station_id' => $validated['station_id'] ?? null,
            ]);

            $this->syncBillPaymentBalancesAndStatus($bill);
        });

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function update(UpdateBillPaymentRequest $request, Bill $bill, Payment $payment): RedirectResponse
    {
        $this->assertPaymentBelongsToBill($bill, $payment);

        if (! in_array($bill->status, ['partial', 'paid'], true)) {
            abort(422, 'Payments can only be edited on partially or fully paid bills.');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $bill, $payment): void {
            $payment->update([
                'amount' => (float) $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'station_id' => $validated['station_id'] ?? null,
            ]);

            $this->syncBillPaymentBalancesAndStatus($bill);
        });

        return back()->with('success', 'Payment updated successfully.');
    }

    public function destroy(Bill $bill, Payment $payment): RedirectResponse
    {
        $this->assertPaymentBelongsToBill($bill, $payment);

        if (! in_array($bill->status, ['partial', 'paid'], true)) {
            abort(422, 'Payments can only be removed from partially or fully paid bills.');
        }

        DB::transaction(function () use ($bill, $payment): void {
            $payment->delete();
            $this->syncBillPaymentBalancesAndStatus($bill);
        });

        return back()->with('success', 'Payment removed successfully.');
    }

    private function assertPaymentBelongsToBill(Bill $bill, Payment $payment): void
    {
        if ($payment->payable_type !== Bill::class || (int) $payment->payable_id !== (int) $bill->id) {
            abort(404);
        }
    }

    private function syncBillPaymentBalancesAndStatus(Bill $bill): void
    {
        $billTotal = (float) $bill->total_amount;
        $runningPaid = 0.0;

        $payments = $bill->payments()
            ->orderBy('payment_date')
            ->orderBy('id')
            ->get();

        foreach ($payments as $payment) {
            $runningPaid += (float) $payment->amount;
            $balanceAfter = max(0.0, round($billTotal - $runningPaid, 2));

            $payment->update([
                'current_balance' => $balanceAfter,
            ]);
        }

        $paidTotal = round($runningPaid, 2);

        $status = match (true) {
            $paidTotal <= 0.0 => 'pending',
            $paidTotal + 0.00001 < $billTotal => 'partial',
            default => 'paid',
        };

        $bill->update([
            'status' => $status,
        ]);
    }

    private function normalizeStationRequest(Request $request): void
    {
        $raw = $request->input('station_id');

        if ($raw === '' || $raw === null) {
            $request->merge(['station_id' => null]);
        } elseif (is_numeric($raw)) {
            $request->merge(['station_id' => (int) $raw]);
        }
    }
}
