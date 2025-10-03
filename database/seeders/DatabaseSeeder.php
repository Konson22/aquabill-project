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
            UserSeeder::class,
            NeighborhoodSeeder::class,
            CategorySeeder::class,
            MeterSeeder::class,
            CustomerSeeder::class,
            SupplierSeeder::class,
            InventoryItemSeeder::class,
            VehicleSeeder::class,
            ChargeSeeder::class,
            MeterReadingSeeder::class,
            BillSeeder::class,
            InvoiceSeeder::class,
            PaymentSeeder::class,
        ]);
    }
}


