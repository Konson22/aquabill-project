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
        // Tariffs mapped to customer types: C1, C2, C3, C4, DOMESTIC, HTL, OFFICE
        $tariffs = [
            [
                'name' => 'C1',
                'price' => 40.00,
                'fixed_charge' => 2500,
                'description' => 'Basic residential water tariff',
            ],
            [
                'name' => 'C2',
                'price' => 4500,
                'fixed_charge' => 2500,
                'description' => 'Standard residential water tariff',
            ],
            [
                'name' => 'C3',
                'price' => 5000,
                'fixed_charge' => 3000,
                'description' => 'Premium residential water tariff',
            ],
            [
                'name' => 'C4',
                'price' => 6000,
                'fixed_charge' => 2500,
                'description' => 'Commercial tariff for small businesses',
            ],
            [
                'name' => 'DOMESTIC',
                'price' => 4000,
                'fixed_charge' => 2000,
                'description' => 'Domestic residential water tariff',
            ],
            [
                'name' => 'HOTEL',
                'price' => 5000,
                'fixed_charge' => 2500,
                'description' => 'Hotel and hospitality tariff',
            ],
            [
                'name' => 'OFFICE',
                'price' => 6000,
                'fixed_charge' => 3000,
                'description' => 'Office and commercial space tariff',
            ],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::create($tariff);
        }
    }
}

