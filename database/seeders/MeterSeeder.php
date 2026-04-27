<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Meter;
use Illuminate\Database\Seeder;

class MeterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();

        foreach ($customers as $customer) {
            if ($customer->meters()->exists()) {
                continue;
            }

            Meter::create([
                'customer_id' => $customer->id,
                'meter_number' => 'MTR-'.str_pad($customer->id, 5, '0', STR_PAD_LEFT),
                'status' => 'active',
            ]);
        }
    }
}
