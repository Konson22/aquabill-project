<?php

namespace Database\Seeders;

use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\User;
use Illuminate\Database\Seeder;

class MeterReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meters = Meter::all();
        $user = User::first();

        foreach ($meters as $meter) {
            MeterReading::create([
                'meter_id' => $meter->id,
                'reading_date' => now()->subMonth(),
                'previous_reading' => 0,
                'current_reading' => 100,
                'recorded_by' => $user->id,
                'notes' => 'Initial reading',
                'is_initial' => true,
            ]);
        }
    }
}
