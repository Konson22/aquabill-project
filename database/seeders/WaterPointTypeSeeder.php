<?php

namespace Database\Seeders;

use App\Models\WaterPointType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WaterPointTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Filling Station', 'description' => 'Bulk water filling for tankers and containers.'],
            ['name' => 'Public Tap', 'description' => 'Shared standpost for community access.'],
            ['name' => 'Water Kiosk', 'description' => 'Prepaid or staffed water sales point.'],
            ['name' => 'Standpipe', 'description' => 'Fixed street-level outlet.'],
            ['name' => 'Borehole', 'description' => 'Groundwater abstraction point.'],
            ['name' => 'Tank', 'description' => 'Storage tank or tower outlet.'],
        ];

        foreach ($types as $row) {
            WaterPointType::updateOrCreate(
                ['slug' => Str::slug($row['name'])],
                [
                    'name' => $row['name'],
                    'description' => $row['description'],
                ],
            );
        }
    }
}
