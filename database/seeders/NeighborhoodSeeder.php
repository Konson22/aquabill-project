<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Neighborhood;

class NeighborhoodSeeder extends Seeder
{
    public function run(): void
    {
        $neighborhoods = [
            'Downtown',
            'Residential Area A',
            'Residential Area B',
            'Industrial Zone',
            'Commercial District',
            'Suburban Area',
            'Waterfront District',
            'Hillside Community',
            'Garden Suburb',
            'Business Park',
        ];

        foreach ($neighborhoods as $name) {
            Neighborhood::firstOrCreate(['name' => $name]);
        }
    }
}
