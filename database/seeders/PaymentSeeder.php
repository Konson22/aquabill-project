<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Station;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    private const PAYMENT_METHODS = ['cash', 'bank', 'mobile_money', 'cheque'];

    public function run(): void
    {
        if (Payment::query()->exists()) {
            $this->command?->warn('Payments already exist. Skipping PaymentSeeder.');

            return;
        }

        $recorder = User::query()->orderBy('id')->first();
        $station = Station::query()->orderBy('name')->first();

        if ($recorder === null) {
            $this->command?->warn('No users found. Skipping PaymentSeeder.');

            return;
        }

        $billPayments = $this->seedBillPayments($recorder->id, $station?->id);
        $chargePayments = $this->seedServiceChargePayments($recorder->id, $station?->id);

        $this->command?->info("Seeded {$billPayments} bill payment(s) and {$chargePayments} service charge payment(s).");
    }

    private function seedBillPayments(int $recorderId, ?int $stationId): int
    {
        $bills = Bill::query()
            ->whereIn('status', ['pending', 'partial'])
            ->whereDoesntHave('payments')
            ->orderBy('id')
            ->get();

        if ($bills->isEmpty()) {
            return 0;
        }

        $created = 0;

        foreach ($bills->values() as $index => $bill) {
            $total = (float) $bill->total_amount;

            if ($total <= 0) {
                continue;
            }

            if ($index % 2 !== 0) {
                continue;
            }

            $amount = $index % 4 === 0
                ? $total
                : round($total * fake()->randomFloat(2, 0.35, 0.7), 2);

            if ($amount <= 0 || $amount > $total) {
                continue;
            }

            $this->recordBillPayment($bill, $amount, $recorderId, $stationId);
            $created++;
        }

        return $created;
    }

    private function recordBillPayment(Bill $bill, float $amount, int $recorderId, ?int $stationId): void
    {
        DB::transaction(function () use ($bill, $amount, $recorderId, $stationId): void {
            $bill->payments()->create([
                'amount' => $amount,
                'current_balance' => 0,
                'payment_date' => fake()->dateTimeBetween('-60 days', 'now')->format('Y-m-d'),
                'payment_method' => fake()->randomElement(self::PAYMENT_METHODS),
                'reference_number' => fake()->optional(0.4)->bothify('RCPT-####??'),
                'notes' => "Seeded payment for bill #{$bill->id}",
                'recorded_by' => $recorderId,
                'station_id' => $stationId,
            ]);

            $this->syncBillPaymentBalancesAndStatus($bill->fresh());
        });
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

    private function seedServiceChargePayments(int $recorderId, ?int $stationId): int
    {
        $charges = ServiceCharge::query()
            ->where('status', 'unpaid')
            ->whereDoesntHave('payments')
            ->get();

        if ($charges->isEmpty()) {
            return 0;
        }

        $created = 0;
        $payCount = (int) max(1, floor($charges->count() / 2));
        $toPay = $charges->take($payCount);

        foreach ($toPay as $charge) {
            DB::transaction(function () use ($charge, $recorderId, $stationId): void {
                $amount = $charge->totalDueFloat();

                $charge->payments()->create([
                    'amount' => $amount,
                    'current_balance' => 0.0,
                    'payment_date' => fake()->dateTimeBetween('-45 days', 'now')->format('Y-m-d'),
                    'payment_method' => fake()->randomElement(self::PAYMENT_METHODS),
                    'reference_number' => fake()->optional(0.35)->bothify('SVC-####??'),
                    'notes' => "Seeded payment for service charge #{$charge->id}",
                    'recorded_by' => $recorderId,
                    'station_id' => $stationId,
                ]);

                $charge->update(['status' => 'paid']);
            });

            $created++;
        }

        return $created;
    }
}
