<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceChargeSeeder extends Seeder
{
    public function run(): void
    {
        if (ServiceCharge::query()->exists()) {
            $this->command?->warn('Service charges already exist. Skipping ServiceChargeSeeder.');

            return;
        }

        $customers = Customer::query()->where('status', 'active')->get();
        $types = ServiceChargeType::query()->get();
        $issuer = User::query()->orderBy('id')->first();

        if ($customers->isEmpty() || $types->isEmpty() || $issuer === null) {
            $this->command?->warn('Missing customers, charge types, or users. Skipping ServiceChargeSeeder.');

            return;
        }

        $created = 0;
        $sampleSize = min(15, $customers->count());

        foreach ($customers->random($sampleSize) as $customer) {
            $chargeCount = 2;

            for ($i = 0; $i < $chargeCount; $i++) {
                $type = $types->random();
                $issuedDate = now()->subDays(fake()->numberBetween(5, 90));

                ServiceCharge::query()->create([
                    'customer_id' => $customer->id,
                    'service_charge_type_id' => $type->id,
                    'amount' => $type->amount,
                    'other_charges' => fake()->randomElement([0, 0, 5, 10]),
                    'issued_by' => $issuer->id,
                    'issued_date' => $issuedDate,
                    'due_date' => $issuedDate->copy()->addDays(30),
                    'status' => 'unpaid',
                    'notes' => "Seeded {$type->name} for {$customer->name}",
                ]);

                $created++;
            }
        }

        $this->command?->info("Seeded {$created} service charge(s).");
    }
}
