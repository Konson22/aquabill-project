<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use Exception;
use Illuminate\Support\Facades\DB;

class BillService
{
    /**
     * Generate a bill for a specific meter.
     *
     * @param  int|Meter  $meter
     *
     * @throws Exception
     */
    public function generateForMeter($meter): ?Bill
    {
        if (is_numeric($meter)) {
            $meter = Meter::with('customer.tariff')->findOrFail($meter);
        }

        $customer = $meter->customer;

        // Keep previous bill statuses in sync with recorded payments
        $this->syncCustomerBillStatuses($customer->id);

        // 1. Get latest meter reading that does NOT already have a bill
        $reading = $meter->readings()
            ->where('customer_id', $customer->id)
            ->whereDoesntHave('bill')
            ->latest('reading_date')
            ->first();

        if (! $reading) {
            return null;
        }

        // 2. Get active tariff (from customer or default)
        $tariff = $customer->tariff ?? Tariff::where('is_default', true)->where('status', 'active')->first();

        if (! $tariff) {
            throw new Exception("No active tariff found for meter #{$meter->meter_number}");
        }

        // 3. Calculate consumption
        $consumption = max(0, $reading->consumption);

        // 4. Compute current charge
        $unitPrice = $tariff->price_per_unit;
        $fixedCharge = $tariff->fixed_charge;
        $currentCharge = ($consumption * $unitPrice);

        // 5. Compute previous balance as total outstanding from pending/partial bills
        $previousBills = Bill::query()
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['pending', 'partial'])
            ->get(['id', 'total_amount', 'current_balance']);

        $previousBalance = $previousBills->sum(fn (Bill $bill) => (float) $bill->current_balance);

        $lastOpenBill = Bill::query()
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['pending', 'partial'])
            ->orderByDesc('id')
            ->first(['id']);

        if ($lastOpenBill) {
            $lastOpenBill->update(['status' => 'forwarded']);
        }

        $totalAmount = $currentCharge + $previousBalance + $fixedCharge;

        // 6. Create the bill
        return DB::transaction(function () use ($customer, $meter, $reading, $consumption, $unitPrice, $fixedCharge, $currentCharge, $previousBalance, $totalAmount) {
            return Bill::create([
                'customer_id' => $customer->id,
                'meter_number' => $meter->meter_number,
                'meter_id' => $meter->id,
                'reading_id' => $reading->id,
                // Optional bill number from mobile (stored on reading); server generates when empty.
                'bill_no' => filled($reading->bill_no) ? $reading->bill_no : null,
                // 'tariff_id' removed as per user request, using snapshots instead
                'consumption' => $consumption,
                'unit_price' => $unitPrice,
                'fixed_charge' => $fixedCharge,
                'current_charge' => $currentCharge,
                'previous_balance' => $previousBalance,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'due_date' => now()->addDays(30),
            ]);
        });
    }

    /**
     * Recalculate amounts on the bill tied to this reading when readings are corrected (uses tariff snapshots on the bill).
     */
    public function syncBillForReading(MeterReading $reading): void
    {
        $reading->loadMissing('bill');
        $bill = $reading->bill;

        if (! $bill) {
            return;
        }

        $consumption = max(0.0, (float) $reading->consumption);
        $unitPrice = (float) $bill->unit_price;
        $fixedCharge = (float) $bill->fixed_charge;
        $currentCharge = ($consumption * $unitPrice) + $fixedCharge;
        $previousBalance = (float) $bill->previous_balance;
        $totalAmount = $currentCharge + $previousBalance;

        $paid = (float) $bill->amount_paid;

        $status = match (true) {
            $paid <= 0.00001 => 'pending',
            $paid + 0.00001 >= $totalAmount => 'paid',
            default => 'partial',
        };

        $bill->update([
            'consumption' => $consumption,
            'current_charge' => $currentCharge,
            'total_amount' => $totalAmount,
            'status' => $status,
        ]);
    }

    private function syncCustomerBillStatuses(int $customerId): void
    {
        $bills = Bill::query()
            ->where('customer_id', $customerId)
            ->whereIn('status', ['pending', 'partial', 'paid'])
            ->get(['id', 'total_amount', 'amount_paid', 'status']);

        foreach ($bills as $bill) {
            $paidTotal = (float) $bill->amount_paid;

            $billTotal = (float) $bill->total_amount;

            $status = match (true) {
                $paidTotal <= 0.0 => 'pending',
                $paidTotal + 0.00001 < $billTotal => 'partial',
                default => 'paid',
            };

            if ($status !== $bill->status) {
                $bill->update(['status' => $status]);
            }
        }
    }
}
