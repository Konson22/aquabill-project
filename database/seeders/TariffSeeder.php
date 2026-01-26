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
                'price' => 2.50,
                'fixed_charge' => 10.00,
                'description' => 'Basic residential water tariff',
            ],
            [
                'name' => 'C2',
                'price' => 3.00,
                'fixed_charge' => 15.00,
                'description' => 'Standard residential water tariff',
            ],
            [
                'name' => 'C3',
                'price' => 3.50,
                'fixed_charge' => 20.00,
                'description' => 'Premium residential water tariff',
            ],
            [
                'name' => 'C4',
                'price' => 4.00,
                'fixed_charge' => 25.00,
                'description' => 'Commercial tariff for small businesses',
            ],
            [
                'name' => 'DOMESTIC',
                'price' => 2.50,
                'fixed_charge' => 10.00,
                'description' => 'Domestic residential water tariff',
            ],
            [
                'name' => 'HOTEL',
                'price' => 4.50,
                'fixed_charge' => 35.00,
                'description' => 'Hotel and hospitality tariff',
            ],
            [
                'name' => 'OFFICE',
                'price' => 4.00,
                'fixed_charge' => 25.00,
                'description' => 'Office and commercial space tariff',
            ],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::create($tariff);
        }
    }
}

