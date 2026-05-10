<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\WaterPoint;
use App\Models\WaterPointReading;
use Illuminate\Database\Seeder;

class WaterPointReadingSeeder extends Seeder
{
    /**
     * Demo meter history for GIS water points (idempotent per point).
     */
    public function run(): void
    {
        if (WaterPoint::query()->whereNotNull('meter_no')->doesntExist()) {
            return;
        }

        $recordedBy = User::query()->value('id');

        foreach (WaterPoint::query()->whereNotNull('meter_no')->orderBy('id')->cursor() as $point) {
            if ($point->readings()->exists()) {
                continue;
            }

            WaterPointReading::query()->create([
                'water_point_id' => $point->id,
                'reading_date' => '2026-02-01',
                'previous_reading' => 0,
                'current_reading' => 100,
                'recorded_by' => $recordedBy,
                'notes' => 'Demo initial reading',
                'is_initial' => true,
            ]);

            WaterPointReading::query()->create([
                'water_point_id' => $point->id,
                'reading_date' => '2026-03-01',
                'previous_reading' => null,
                'current_reading' => 145,
                'recorded_by' => $recordedBy,
                'notes' => 'Demo follow-up',
                'is_initial' => false,
            ]);

            WaterPointReading::query()->create([
                'water_point_id' => $point->id,
                'reading_date' => '2026-04-01',
                'previous_reading' => null,
                'current_reading' => 188,
                'recorded_by' => $recordedBy,
                'notes' => 'Demo latest',
                'is_initial' => false,
            ]);
        }
    }
}
