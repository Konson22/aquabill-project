<?php

namespace Database\Seeders;

use App\Models\Tariff;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tariff::updateOrCreate(
            ['name' => 'DOMESTIC'],
            [
                'price_per_unit' => 50.00,
                'fixed_charge' => 0.00,
            ],
        );
    }
}
