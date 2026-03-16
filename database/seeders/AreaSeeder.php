<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only one zone/area pair for this dataset.
        $zonesData = [
            'JEBEL SUK' => [
                'HAI GWONGOROKI',
            ],
        ];

        foreach ($zonesData as $zoneName => $areas) {
            $zone = Zone::where('name', $zoneName)->first();

            if ($zone) {
                foreach ($areas as $areaName) {
                    Area::updateOrCreate(
                        [
                            'zone_id' => $zone->id,
                            'name' => $areaName,
                        ],
                        [
                            'description' => "Location: $areaName in $zoneName",
                        ]
                    );
                }
            }
        }
    }
}
