<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            ZoneSeeder::class,
            TariffSeeder::class,
            CustomerSeeder::class,
            MeterSeeder::class,
            ServiceChargeTypeSeeder::class,
            // ServiceChargeSeeder::class,
            // MeterReadingSeeder::class,
        ]);
    }
}
