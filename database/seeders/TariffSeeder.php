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
        // Tariffs mapped to customer types: DOMESTIC only
        $tariffs = [
            [
                'name' => 'DOMESTIC',
                'price' => 4000,
                'fixed_charge' => 2500,
                'description' => 'Domestic residential water tariff',
            ],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::create($tariff);
        }
    }
}

