<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            [
                'name' => 'North Zone',
                'code' => 'NZ',
                'description' => 'Northern region of the city',
            ],
            [
                'name' => 'South Zone',
                'code' => 'SZ',
                'description' => 'Southern region of the city',
            ],
            [
                'name' => 'East Zone',
                'code' => 'EZ',
                'description' => 'Eastern region of the city',
            ],
            [
                'name' => 'West Zone',
                'code' => 'WZ',
                'description' => 'Western region of the city',
            ],
        ];

        foreach ($zones as $zone) {
            Zone::create($zone);
        }
    }
}
