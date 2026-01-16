<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            UserSeeder::class,
            ZoneSeeder::class,
            AreaSeeder::class,
            // CustomerSeeder::class,
            // TariffSeeder::class,
            // TariffHistorySeeder::class,
            // HomeSeeder::class,
            // MeterSeeder::class,
            // MeterReadingSeeder::class,
            // BillSeeder::class,
            // InvoiceSeeder::class,
            // PaymentSeeder::class,
        ]);
    }
}
