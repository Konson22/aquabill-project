<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceChargeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = \App\Models\Customer::all();
        $types = \App\Models\ServiceChargeType::all();
        $users = \App\Models\User::all();

        if ($customers->isEmpty() || $types->isEmpty()) {
            return;
        }

        foreach ($customers->random(min(10, $customers->count())) as $customer) {
            // Apply 1-3 random service charges per selected customer
            for ($i = 0; $i < rand(1, 3); $i++) {
                $type = $types->random();
                \App\Models\ServiceCharge::create([
                    'customer_id' => $customer->id,
                    'bill_id' => $customer->bills()->inRandomOrder()->first()?->id,
                    'service_charge_type_id' => $type->id,
                    'amount' => $type->amount,
                    'issued_by' => $users->random()->id,
                    'issued_date' => now()->subDays(rand(1, 60)),
                    'due_date' => now()->addDays(rand(1, 15)),
                    'status' => rand(0, 1) ? 'paid' : 'unpaid',
                    'notes' => 'Sample service charge for ' . $type->name,
                ]);
            }
        }
    }
}
