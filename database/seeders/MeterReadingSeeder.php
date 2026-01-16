<?php

namespace Database\Seeders;

use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MeterReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meters = Meter::all();
        $users = User::where('department', 'meters')->get();

        if ($meters->isEmpty()) {
            $this->command->warn('No meters found. Please run MeterSeeder first.');
            return;
        }

        if ($users->isEmpty()) {
            $this->command->warn('No meter department users found. Please run UserSeeder first.');
            return;
        }

        foreach ($meters as $meter) {
            // Get tariff information from the meter's home
            $tariff = $meter->home?->tariff;
            $tariffPrice = $tariff?->price ?? 3.00; // Default to 3.00 if no tariff
            $fixCharges = $tariff?->fixed_charge ?? 15.00; // Default to 15.00 if no tariff

            // Create 3-5 readings per meter with different dates
            $numReadings = rand(3, 5);
            $previousReading = 0;
            $previousBalance = 0;

            for ($i = 0; $i < $numReadings; $i++) {
                $readingDate = now()->subMonths($numReadings - $i)->startOfMonth()->addDays(rand(1, 10));
                $currentReading = $previousReading + rand(50, 500);
                $consumption = $i > 0 ? $currentReading - $previousReading : 0;
                
                $status = $i === $numReadings - 1 ? 'pending' : 'billed';

                MeterReading::create([
                    'meter_id' => $meter->id,
                    'home_id' => $meter->home_id,
                    'reading_date' => $readingDate,
                    'current_reading' => $currentReading,
                    'previous_reading' => $i > 0 ? $previousReading : null,
                    'consumption' => $consumption > 0 ? $consumption : null,
                    'read_by' => $users->random()->id,
                    'status' => $status,
                    'tariff' => $tariffPrice,
                    'fix_charges' => $fixCharges,
                    'previous_balance' => $i > 0 ? $previousBalance : 0,
                ]);

                // Update previous balance for next reading (simulate bill payment)
                // For billed readings, previous balance could be 0 (paid) or carry forward
                if ($status === 'billed') {
                    $previousBalance = rand(0, 1) === 0 ? 0 : rand(100, 1000); // 50% chance of having balance
                }

                $previousReading = $currentReading;
            }
        }
    }
}

