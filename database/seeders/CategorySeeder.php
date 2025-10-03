<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Residential - Low Income',
                'type_id' => 'RES_LOW',
                'tariff' => 15.50,
                'fixed_charge' => 25.00,
            ],
            [
                'name' => 'Residential - Standard',
                'type_id' => 'RES_STD',
                'tariff' => 22.75,
                'fixed_charge' => 35.00,
            ],
            [
                'name' => 'Residential - High Income',
                'type_id' => 'RES_HIGH',
                'tariff' => 28.90,
                'fixed_charge' => 45.00,
            ],
            [
                'name' => 'Commercial - Small',
                'type_id' => 'COM_SMALL',
                'tariff' => 35.25,
                'fixed_charge' => 75.00,
            ],
            [
                'name' => 'Commercial - Medium',
                'type_id' => 'COM_MED',
                'tariff' => 42.50,
                'fixed_charge' => 125.00,
            ],
            [
                'name' => 'Commercial - Large',
                'type_id' => 'COM_LARGE',
                'tariff' => 55.75,
                'fixed_charge' => 200.00,
            ],
            [
                'name' => 'Industrial - Light',
                'type_id' => 'IND_LIGHT',
                'tariff' => 48.90,
                'fixed_charge' => 150.00,
            ],
            [
                'name' => 'Industrial - Heavy',
                'type_id' => 'IND_HEAVY',
                'tariff' => 65.25,
                'fixed_charge' => 300.00,
            ],
            [
                'name' => 'Government',
                'type_id' => 'GOV',
                'tariff' => 18.50,
                'fixed_charge' => 50.00,
            ],
            [
                'name' => 'Educational',
                'type_id' => 'EDU',
                'tariff' => 20.00,
                'fixed_charge' => 40.00,
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
