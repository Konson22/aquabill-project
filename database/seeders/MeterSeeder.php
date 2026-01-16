<?php

namespace Database\Seeders;

use App\Models\Home;
use App\Models\Meter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class MeterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Meter::truncate();
        Schema::enableForeignKeyConstraints();

        // $homes = Home::all();

        // if ($homes->isEmpty()) {
        //     $this->command->warn('No homes found. Please run HomeSeeder first.');
        //     return;
        // }

        $meterTypes = ['Digital', 'Analog'];
        $meterCounter = 230000000;

        for ($i = 0; $i < 8000; $i++) {
            Meter::create([
                'home_id' => null,
                'meter_number' => 'SSUWC/ZH/JB/' . $meterCounter++,
                'meter_type' => $meterTypes[array_rand($meterTypes)],
                'installation_date' => now()->subDays(rand(30, 365)),
                'status' => 'inactive',
            ]);
        }
    }
}
