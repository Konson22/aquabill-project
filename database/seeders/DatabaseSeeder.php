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
            AppSettingSeeder::class,
            DepartmentSeeder::class,
            HrDepartmentSeeder::class,
            PermissionSeeder::class,
            LeaveTypeSeeder::class,
            DocumentTypeSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            ZoneSeeder::class,
            SupplyScheduleSeeder::class,
            StationSeeder::class,
            GisDemoDataSeeder::class,
            WaterPointReadingSeeder::class,
            TariffSeeder::class,
            CustomerSeeder::class,
            MeterSeeder::class,
            ServiceChargeTypeSeeder::class,
            MeterReadingSeeder::class,
            ServiceChargeSeeder::class,
            PaymentSeeder::class,
        ]);
    }
}
