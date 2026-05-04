<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceChargeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $types = ServiceChargeType::all();
        $users = User::all();

        if ($customers->isEmpty() || $types->isEmpty()) {
            return;
        }

        foreach ($customers->random(min(10, $customers->count())) as $customer) {
            // Apply 1-3 random service charges per selected customer
            for ($i = 0; $i < rand(1, 3); $i++) {
                $type = $types->random();
                ServiceCharge::create([
                    'customer_id' => $customer->id,
                    'service_charge_type_id' => $type->id,
                    'amount' => $type->amount,
                    'issued_by' => $users->random()->id,
                    'issued_date' => now()->subDays(rand(1, 60)),
                    'due_date' => now()->addDays(rand(1, 15)),
                    'status' => rand(0, 1) ? 'paid' : 'unpaid',
                    'notes' => 'Sample service charge for '.$type->name,
                ]);
            }
        }
    }
}
