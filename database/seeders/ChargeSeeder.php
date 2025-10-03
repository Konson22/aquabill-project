<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Charge;
use App\Models\Category;

class ChargeSeeder extends Seeder
{
    public function run(): void
    {
        // Get categories for relationships
        $categories = Category::all();

        if ($categories->isEmpty()) {
            $this->command->warn('Please run CategorySeeder first.');
            return;
        }

        $charges = [
            [
                'charge_amount' => 5.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
            ],
            [
                'charge_amount' => 10.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
            ],
            [
                'charge_amount' => 15.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
            ],
            [
                'charge_amount' => 25.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
            ],
            [
                'charge_amount' => 8.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
            ],
            [
                'charge_amount' => 15.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
            ],
            [
                'charge_amount' => 20.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
            ],
            [
                'charge_amount' => 35.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
            ],
            [
                'charge_amount' => 3.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'RES_LOW')->first()->id,
            ],
            [
                'charge_amount' => 7.50,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'RES_LOW')->first()->id,
            ],
            [
                'charge_amount' => 10.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'RES_LOW')->first()->id,
            ],
            [
                'charge_amount' => 20.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'RES_LOW')->first()->id,
            ],
            [
                'charge_amount' => 50.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'COM_SMALL')->first()->id,
            ],
            [
                'charge_amount' => 75.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'COM_SMALL')->first()->id,
            ],
            [
                'charge_amount' => 30.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'COM_SMALL')->first()->id,
            ],
            [
                'charge_amount' => 100.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'COM_SMALL')->first()->id,
            ],
            [
                'charge_amount' => 100.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'COM_MED')->first()->id,
            ],
            [
                'charge_amount' => 150.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'COM_MED')->first()->id,
            ],
            [
                'charge_amount' => 50.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'COM_MED')->first()->id,
            ],
            [
                'charge_amount' => 200.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'COM_MED')->first()->id,
            ],
            [
                'charge_amount' => 200.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'COM_LARGE')->first()->id,
            ],
            [
                'charge_amount' => 300.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'COM_LARGE')->first()->id,
            ],
            [
                'charge_amount' => 75.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'COM_LARGE')->first()->id,
            ],
            [
                'charge_amount' => 400.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'COM_LARGE')->first()->id,
            ],
            [
                'charge_amount' => 25.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'GOV')->first()->id,
            ],
            [
                'charge_amount' => 50.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'GOV')->first()->id,
            ],
            [
                'charge_amount' => 20.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'GOV')->first()->id,
            ],
            [
                'charge_amount' => 75.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'GOV')->first()->id,
            ],
            [
                'charge_amount' => 15.00,
                'description' => 'Connection Fee',
                'category_id' => $categories->where('type_id', 'EDU')->first()->id,
            ],
            [
                'charge_amount' => 30.00,
                'description' => 'Late Payment Fee',
                'category_id' => $categories->where('type_id', 'EDU')->first()->id,
            ],
            [
                'charge_amount' => 15.00,
                'description' => 'Meter Reading Fee',
                'category_id' => $categories->where('type_id', 'EDU')->first()->id,
            ],
            [
                'charge_amount' => 50.00,
                'description' => 'Service Restoration Fee',
                'category_id' => $categories->where('type_id', 'EDU')->first()->id,
            ],
        ];

        foreach ($charges as $charge) {
            Charge::firstOrCreate(
                [
                    'description' => $charge['description'],
                    'category_id' => $charge['category_id']
                ],
                $charge
            );
        }
    }
}
