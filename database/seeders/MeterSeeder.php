<?php

namespace Database\Seeders;

use App\Models\Home;
use App\Models\Meter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MeterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $homes = Home::all();

        if ($homes->isEmpty()) {
            $this->command->warn('No homes found. Please run HomeSeeder first.');
            return;
        }

        $meterTypes = ['Digital', 'Analog', 'Smart'];
        $meterCounter = 1000;

        foreach ($homes as $home) {
            Meter::create([
                'home_id' => $home->id,
                'meter_number' => 'MTR-' . str_pad($meterCounter++, 6, '0', STR_PAD_LEFT),
                'meter_type' => $meterTypes[array_rand($meterTypes)],
                'installation_date' => now()->subDays(rand(30, 365)),
                'status' => 'active',
            ]);
        }
    }
}
