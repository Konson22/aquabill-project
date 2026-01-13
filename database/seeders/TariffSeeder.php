<?php

namespace Database\Seeders;

use App\Models\Tariff;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tariffs = [
            [
                'name' => 'Residential - Basic',
                'price' => 2.50,
                'fixed_charge' => 10.00,
                'description' => 'Basic residential water tariff for standard consumption',
            ],
            [
                'name' => 'Residential - Standard',
                'price' => 3.00,
                'fixed_charge' => 15.00,
                'description' => 'Standard residential water tariff with moderate consumption allowance',
            ],
            [
                'name' => 'Residential - Premium',
                'price' => 3.50,
                'fixed_charge' => 20.00,
                'description' => 'Premium residential water tariff for higher consumption',
            ],
            [
                'name' => 'Commercial - Small',
                'price' => 4.00,
                'fixed_charge' => 25.00,
                'description' => 'Commercial tariff for small businesses and shops',
            ],
            [
                'name' => 'Commercial - Medium',
                'price' => 4.50,
                'fixed_charge' => 35.00,
                'description' => 'Commercial tariff for medium-sized businesses',
            ],
            [
                'name' => 'Commercial - Large',
                'price' => 5.00,
                'fixed_charge' => 50.00,
                'description' => 'Commercial tariff for large commercial establishments',
            ],
            [
                'name' => 'Industrial',
                'price' => 6.00,
                'fixed_charge' => 75.00,
                'description' => 'Industrial water tariff for manufacturing and production facilities',
            ],
            [
                'name' => 'Institutional',
                'price' => 3.75,
                'fixed_charge' => 30.00,
                'description' => 'Tariff for schools, hospitals, and other institutional buildings',
            ],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::create($tariff);
        }
    }
}

