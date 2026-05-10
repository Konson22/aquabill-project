<?php

namespace Database\Seeders;

use App\Models\Pipe;
use App\Models\Valve;
use App\Models\WaterPoint;
use App\Models\WaterPointType;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class GisDemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call(WaterPointTypeSeeder::class);

        $zone = Zone::query()->first();
        if ($zone === null) {
            return;
        }

        $type = static fn (string $slug): ?WaterPointType => WaterPointType::query()->where('slug', $slug)->first();

        $points = [
            ['code' => 'WP-JUB-001', 'meter_no' => 'WM-GIS-6001', 'name' => 'Nile Street Filling Station', 'slug' => 'filling-station', 'lat' => 4.85941, 'lng' => 31.57125, 'phone' => '+211912000001'],
            ['code' => 'WP-JUB-002', 'meter_no' => 'WM-GIS-6002', 'name' => 'Customs Market Public Tap', 'slug' => 'public-tap', 'lat' => 4.85620, 'lng' => 31.56880, 'phone' => '+211912000002'],
            ['code' => 'WP-JUB-003', 'meter_no' => 'WM-GIS-6003', 'name' => 'Gudele Water Kiosk', 'slug' => 'water-kiosk', 'lat' => 4.87210, 'lng' => 31.58240, 'phone' => '+211912000003'],
            ['code' => 'WP-JUB-004', 'meter_no' => 'WM-GIS-6004', 'name' => 'Hai Malakal Standpipe', 'slug' => 'standpipe', 'lat' => 4.85050, 'lng' => 31.55990, 'phone' => '+211912000004'],
            ['code' => 'WP-JUB-005', 'meter_no' => 'WM-GIS-6005', 'name' => 'Lologo Borehole', 'slug' => 'borehole', 'lat' => 4.88330, 'lng' => 31.60120, 'phone' => '+211912000005'],
            ['code' => 'WP-JUB-006', 'meter_no' => 'WM-GIS-6006', 'name' => 'Juba Town Tank Outlet', 'slug' => 'tank', 'lat' => 4.86700, 'lng' => 31.57700, 'phone' => '+211912000006'],
        ];

        foreach ($points as $row) {
            $t = $type($row['slug']);
            if ($t === null) {
                continue;
            }
            WaterPoint::updateOrCreate(
                ['code' => $row['code']],
                [
                    'meter_no' => $row['meter_no'],
                    'name' => $row['name'],
                    'water_point_type_id' => $t->id,
                    'zone_id' => $zone->id,
                    'latitude' => $row['lat'],
                    'longitude' => $row['lng'],
                    'manager_name' => 'Field Supervisor',
                    'manager_phone' => $row['phone'],
                    'status' => 'active',
                    'description' => 'Demo GIS record for Juba area.',
                ],
            );
        }

        $mainPipe = Pipe::updateOrCreate(
            ['pipe_code' => 'PIPE-MAIN-001'],
            [
                'zone_id' => $zone->id,
                'pipe_type' => 'main',
                'material' => 'Ductile iron',
                'diameter' => 400,
                'length' => 1850.5,
                'coordinates' => [
                    [4.85941, 31.57125],
                    [4.86200, 31.57450],
                    [4.86550, 31.57800],
                ],
                'status' => 'active',
                'installation_date' => '2019-06-01',
                'description' => 'Trunk main along demo corridor.',
            ],
        );

        $distPipe = Pipe::updateOrCreate(
            ['pipe_code' => 'PIPE-DIST-014'],
            [
                'zone_id' => $zone->id,
                'pipe_type' => 'distribution',
                'material' => 'PVC',
                'diameter' => 160,
                'length' => 620,
                'coordinates' => [
                    [4.86200, 31.57450],
                    [4.86080, 31.57620],
                    [4.85920, 31.57780],
                ],
                'status' => 'active',
                'installation_date' => '2020-03-15',
                'description' => 'Distribution loop.',
            ],
        );

        $servicePipe = Pipe::updateOrCreate(
            ['pipe_code' => 'PIPE-SVC-203'],
            [
                'zone_id' => $zone->id,
                'pipe_type' => 'service',
                'material' => 'HDPE',
                'diameter' => 63,
                'length' => 85,
                'coordinates' => [
                    [4.85920, 31.57780],
                    [4.85890, 31.57840],
                ],
                'status' => 'maintenance',
                'installation_date' => '2021-11-20',
                'description' => 'Service lateral to kiosk.',
            ],
        );

        Valve::updateOrCreate(
            ['valve_code' => 'VAL-MAIN-01'],
            [
                'zone_id' => $zone->id,
                'pipe_id' => $mainPipe->id,
                'valve_type' => 'main',
                'latitude' => 4.86020,
                'longitude' => 31.57280,
                'status' => 'open',
                'installation_date' => '2019-06-01',
                'description' => 'Primary trunk isolation.',
            ],
        );

        Valve::updateOrCreate(
            ['valve_code' => 'VAL-CTL-12'],
            [
                'zone_id' => $zone->id,
                'pipe_id' => $distPipe->id,
                'valve_type' => 'control',
                'latitude' => 4.86100,
                'longitude' => 31.57540,
                'status' => 'open',
                'installation_date' => '2020-03-15',
                'description' => 'District PRV zone.',
            ],
        );

        Valve::updateOrCreate(
            ['valve_code' => 'VAL-ISO-88'],
            [
                'zone_id' => $zone->id,
                'pipe_id' => $servicePipe->id,
                'valve_type' => 'isolation',
                'latitude' => 4.85905,
                'longitude' => 31.57810,
                'status' => 'closed',
                'installation_date' => '2021-11-20',
                'description' => 'Kiosk isolation during maintenance.',
            ],
        );
    }
}
