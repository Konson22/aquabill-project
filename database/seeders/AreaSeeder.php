<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = Zone::all();

        if ($zones->isEmpty()) {
            $this->command->warn('No zones found. Please run ZoneSeeder first.');
            return;
        }

        $areas = [
            'North Zone' => [
                ['name' => 'North Area 1', 'code' => 'NA1', 'description' => 'North Area 1'],
                ['name' => 'North Area 2', 'code' => 'NA2', 'description' => 'North Area 2'],
                ['name' => 'North Area 3', 'code' => 'NA3', 'description' => 'North Area 3'],
            ],
            'South Zone' => [
                ['name' => 'South Area 1', 'code' => 'SA1', 'description' => 'South Area 1'],
                ['name' => 'South Area 2', 'code' => 'SA2', 'description' => 'South Area 2'],
                ['name' => 'South Area 3', 'code' => 'SA3', 'description' => 'South Area 3'],
            ],
            'East Zone' => [
                ['name' => 'East Area 1', 'code' => 'EA1', 'description' => 'East Area 1'],
                ['name' => 'East Area 2', 'code' => 'EA2', 'description' => 'East Area 2'],
            ],
            'West Zone' => [
                ['name' => 'West Area 1', 'code' => 'WA1', 'description' => 'West Area 1'],
                ['name' => 'West Area 2', 'code' => 'WA2', 'description' => 'West Area 2'],
            ],
        ];

        foreach ($zones as $zone) {
            if (isset($areas[$zone->name])) {
                foreach ($areas[$zone->name] as $areaData) {
                    Area::create([
                        'zone_id' => $zone->id,
                        'name' => $areaData['name'],
                        'code' => $areaData['code'],
                        'description' => $areaData['description'],
                    ]);
                }
            }
        }
    }
}
