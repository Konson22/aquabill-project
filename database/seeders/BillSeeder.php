<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Category;
use App\Models\Customer;
use App\Models\MeterReading;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        $userIds = User::query()->pluck('id')->all();
        if (empty($userIds)) {
            return; // require users for generated_by
        }

        // Preload tariffs by category
        $categoryCharges = Category::query()->get(['id', 'tariff', 'fixed_charge'])
            ->keyBy('id');

        // For each latest reading per customer, create a bill for that month
        $customers = Customer::query()
            ->whereNotNull('meter_id')
            ->where('is_active', true)
            ->get();

        foreach ($customers as $customer) {
            $latestReading = MeterReading::where('customer_id', $customer->id)
                ->orderByDesc('date')
                ->first();

            if (!$latestReading) {
                continue;
            }

            $periodEnd = Carbon::parse($latestReading->date)->endOfMonth();
            $periodStart = (clone $periodEnd)->startOfMonth();

            $consumption = max(0, $latestReading->value - $latestReading->previous);

            $category = $customer->category_id ? ($categoryCharges[$customer->category_id] ?? null) : null;
            $unitPrice = $category ? (float) $category->tariff : $faker->randomFloat(2, 0.5, 2.5);
            $fixedCharge = $category ? (float) $category->fixed_charge : $faker->randomFloat(2, 1, 5);
            $otherCharge = $faker->boolean(10) ? $faker->randomFloat(2, 0.5, 3) : 0;

            $subtotal = ($consumption * $unitPrice) + $fixedCharge + $otherCharge;
            $prevBalance = $faker->boolean(20) ? $faker->randomFloat(2, 5, 100) : 0;
            $totalAmount = $subtotal + $prevBalance;

            $bill = Bill::create([
                'customer_id' => $customer->id,
                'meter_id' => $customer->meter_id,
                'reading_id' => $latestReading->id,
                'billing_period_start' => $periodStart->toDateString(),
                'billing_period_end' => $periodEnd->toDateString(),
                'prev_balance' => $prevBalance,
                'consumption' => $consumption,
                'unit_price' => $unitPrice,
                'fixed_charge' => $fixedCharge,
                'other_charge' => $otherCharge,
                'total_amount' => $totalAmount,
                'current_balance' => $totalAmount,
                'status' => $faker->randomElement(['unpaid','overdue','partially_paid','unpaid','unpaid']),
                'generated_by' => $faker->randomElement($userIds),
            ]);

            // Optionally mark older unpaid bills as balance forwarded (none yet in seed run)
        }
    }
}


