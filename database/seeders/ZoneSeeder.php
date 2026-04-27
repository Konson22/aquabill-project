<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Zone::updateOrCreate(
            ['name' => 'Jebel'],
            [
                'supply_day' => 'Monday',
                'supply_time' => '08:00:00',
                'description' => 'Default zone for all customers.',
                'status' => 'active',
            ],
        );
    }
}
