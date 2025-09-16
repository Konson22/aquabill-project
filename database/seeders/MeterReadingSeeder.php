<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\MeterReading;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class MeterReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        $userIds = User::query()->pluck('id')->all();
        if (empty($userIds)) {
            return; // cannot seed without users for billing_officer
        }

        // Active customers with meters
        $customers = Customer::query()
            ->whereNotNull('meter_id')
            ->where('is_active', true)
            ->get();

        foreach ($customers as $customer) {
            $months = 6;
            $startMonth = Carbon::now()->subMonths($months);
            $previousValue = $faker->numberBetween(0, 5000);

            for ($m = 1; $m <= $months; $m++) {
                $periodDate = (clone $startMonth)->addMonths($m)->endOfMonth();

                $increment = $faker->numberBetween(5, 80);
                $currentValue = $previousValue + $increment;

                MeterReading::create([
                    'customer_id' => $customer->id,
                    'meter_id' => $customer->meter_id,
                    'billing_officer' => $faker->randomElement($userIds),
                    'value' => $currentValue,
                    'previous' => $previousValue,
                    'illigal_connection' => $faker->boolean(2) ? 1 : 0,
                    'note' => $faker->optional(0.2)->sentence(),
                    'source' => $faker->randomElement(['mobile-app', 'manual', 'import']),
                    'date' => $periodDate->toDateString(),
                ]);

                $previousValue = $currentValue;
            }
        }
    }
}


