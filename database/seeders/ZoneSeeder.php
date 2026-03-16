<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = [
            'JEBEL SUK',
        ];

        foreach ($zones as $zoneName) {
            Zone::updateOrCreate(
                ['name' => $zoneName],
                [
                    'description' => "Service zone for $zoneName",
                ]
            );
        }
    }
}
