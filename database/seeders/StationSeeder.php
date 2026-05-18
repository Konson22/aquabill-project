<?php

namespace Database\Seeders;

use App\Models\Station;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class StationSeeder extends Seeder
{
    /**
     * Default collection desk for the main branch, linked to the seeded finance user.
     */
    public function run(): void
    {
        $financeUserId = User::query()->where('email', 'finance@gmail.com')->value('id');

        if ($financeUserId === null) {
            throw new \RuntimeException('StationSeeder requires UserSeeder: no user with email finance@gmail.com.');
        }

        $zoneId = Zone::query()->where('name', 'Jebel')->value('id');

        Station::updateOrCreate(
            ['name' => 'Main branch'],
            [
                'zone_id' => $zoneId,
                'accountant_id' => $financeUserId,
                'manager_name' => 'Branch Manager',
                'manager_phone' => null,
                'coordinate' => '4.859400,31.571300',
            ],
        );
    }
}
