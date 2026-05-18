<?php

namespace Database\Seeders;

use App\Models\SupplyDay;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lat = 4.8594;
        $lng = 31.5713;
        $d = 0.004;

        Zone::updateOrCreate(
            ['name' => 'Jebel'],
            [
                'supply_day_id' => SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id'),
                'supply_time' => '08:00:00',
                'description' => 'Default zone for all customers.',
                'boundary_geojson' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [$lng - $d, $lat - $d],
                        [$lng + $d, $lat - $d],
                        [$lng + $d, $lat + $d],
                        [$lng - $d, $lat + $d],
                        [$lng - $d, $lat - $d],
                    ]],
                ],
                'status' => 'active',
            ],
        );
    }
}
