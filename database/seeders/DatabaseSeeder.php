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
            RoleSeeder::class,
            CategorySeeder::class,
            NeighborhoodSeeder::class,
            MeterSeeder::class,
            CustomerSeeder::class,
            MeterReadingSeeder::class,
            BillSeeder::class,
            UserSeeder::class,
        ]);
    }
}


