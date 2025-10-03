<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\MeterReading;
use App\Models\User;
use App\Models\Category;

class BillSeeder extends Seeder
{
    public function run(): void
    {
        // Get customers, meter readings, users, and categories for relationships
        $customers = Customer::all();
        $users = User::all();
        $categories = Category::all();

        if ($customers->isEmpty() || $users->isEmpty() || $categories->isEmpty()) {
            $this->command->warn('Please run CustomerSeeder, UserSeeder, and CategorySeeder first.');
            return;
        }

        $bills = [];
        $currentDate = now();

        // Generate bills for the last 12 months for each customer
        foreach ($customers as $customer) {
            $customerMeter = $customer->meter;
            if (!$customerMeter) continue;

            $category = $customer->category;
            if (!$category) continue;

            $unitPrice = $category->tariff;
            $fixedCharge = $category->fixed_charge;

            // Get meter readings for this customer
            $readings = MeterReading::where('customer_id', $customer->id)
                ->orderBy('date')
                ->get();

            if ($readings->isEmpty()) continue;

            $previousBalance = 0;

            // Generate bills based on meter readings
            for ($i = 0; $i < $readings->count() - 1; $i++) {
                $currentReading = $readings[$i];
                $nextReading = $readings[$i + 1];

                $consumption = $nextReading->value - $currentReading->value;
                if ($consumption <= 0) continue; // Skip if no consumption

                $billingPeriodStart = $currentReading->date;
                $billingPeriodEnd = $nextReading->date;

                // Calculate charges
                $consumptionCharge = $consumption * $unitPrice;
                $otherCharge = $this->getRandomOtherCharge();
                $totalAmount = $consumptionCharge + $fixedCharge + $otherCharge + $previousBalance;

                // Determine bill status
                $status = $this->getRandomBillStatus($totalAmount, $previousBalance);

                $bills[] = [
                    'customer_id' => $customer->id,
                    'meter_id' => $customerMeter->id,
                    'reading_id' => $nextReading->id,
                    'billing_period_start' => $billingPeriodStart,
                    'billing_period_end' => $billingPeriodEnd,
                    'prev_balance' => $previousBalance,
                    'consumption' => $consumption,
                    'unit_price' => $unitPrice,
                    'fixed_charge' => $fixedCharge,
                    'other_charge' => $otherCharge,
                    'total_amount' => $totalAmount,
                    'current_balance' => $status === 'paid' ? 0 : $totalAmount,
                    'status' => $status,
                    'generated_by' => $users->random()->id,
                    'created_at' => $billingPeriodEnd,
                    'updated_at' => $billingPeriodEnd,
                ];

                // Update previous balance for next bill
                $previousBalance = $status === 'paid' ? 0 : $totalAmount;
            }
        }

        // Insert bills in batches
        foreach (array_chunk($bills, 100) as $chunk) {
            Bill::insert($chunk);
        }
    }

    private function getRandomOtherCharge(): float
    {
        // Random other charges like late fees, connection fees, etc.
        $charges = [0, 5.00, 10.00, 15.00, 25.00, 50.00];
        return $charges[array_rand($charges)];
    }

    private function getRandomBillStatus(float $totalAmount, float $previousBalance): string
    {
        // If there's a previous balance, more likely to be overdue
        if ($previousBalance > 0) {
            $statuses = ['overdue', 'unpaid', 'partially_paid'];
            $weights = [50, 30, 20];
        } else {
            $statuses = ['paid', 'unpaid', 'overdue', 'partially_paid'];
            $weights = [60, 25, 10, 5];
        }

        return $this->getWeightedRandom($statuses, $weights);
    }

    private function getWeightedRandom(array $items, array $weights): string
    {
        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($items as $index => $item) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $item;
            }
        }
        
        return $items[0]; // Fallback
    }
}
