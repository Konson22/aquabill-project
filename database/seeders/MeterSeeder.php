<?php

namespace Database\Seeders;

use App\Models\Meter;
use Illuminate\Database\Seeder;

class MeterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        $sizes = ['1/2"', '3/4"', '1"', '1-1/2"', '2"'];
        $models = ['AquaFlow', 'HydroMeter', 'ClearRead', 'FlowGuard'];
        $manufactories = ['Sensus', 'Itron', 'Kamstrup', 'Elster'];
        $statuses = ['active', 'inactive', 'maintenance'];

        // Create 150 meters
        $metersToCreate = 150;
        $serials = [];

        for ($i = 0; $i < $metersToCreate; $i++) {
            // ensure unique serials within this seed run
            do {
                $serial = strtoupper($faker->bothify('MTR-####-????'));
            } while (in_array($serial, $serials, true));
            $serials[] = $serial;

            Meter::create([
                'serial' => $serial,
                'status' => $faker->randomElement($statuses),
                'size' => $faker->randomElement($sizes),
                'model' => $faker->randomElement($models),
                'manufactory' => $faker->randomElement($manufactories),
            ]);
        }
    }
}


