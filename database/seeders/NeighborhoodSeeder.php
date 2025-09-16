<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Neighborhood;

class NeighborhoodSeeder extends Seeder
{
    public function run(): void
    {
        $neighborhoods = [
            'Central',
            'Northside',
            'Southside',
            'East End',
            'West End',
            'Old Town',
            'Riverside',
        ];

        foreach ($neighborhoods as $name) {
            Neighborhood::firstOrCreate(['name' => $name]);
        }
    }
}


