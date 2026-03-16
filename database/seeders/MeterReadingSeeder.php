<?php

namespace Database\Seeders;

use App\Models\Meter;
use App\Models\MeterReading;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MeterReadingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meters = Meter::all();

        if ($meters->isEmpty()) {
            $this->command->warn('No meters found. Please run MeterSeeder first.');
            return;
        }

        $jsonPath = base_path('customers.json');
        if (!File::exists($jsonPath)) {
            $this->command->warn("File not found: $jsonPath. Skipping initial meter readings seeding.");
            return;
        }

        $customersData = json_decode(File::get($jsonPath), true);
        if (!is_array($customersData)) {
            $this->command->warn("Invalid JSON format in $jsonPath. Skipping initial meter readings seeding.");
            return;
        }

        // Map cleaned meter numbers -> numeric initialReading (without "M3")
        $initialReadings = [];
        foreach ($customersData as $data) {
            $meterNoRaw = $data['meterNo'] ?? null;
            $initialReadingRaw = $data['initialReading'] ?? null;

            if (!$meterNoRaw || !$initialReadingRaw) {
                continue;
            }

            $cleanMeterNo = str_replace([' ', 'TRM'], '', (string) $meterNoRaw);

            if (preg_match('/([\d.,]+)/', (string) $initialReadingRaw, $matches)) {
                $numeric = (float) str_replace(',', '', $matches[1]);
            } else {
                $numeric = 0;
            }

            if ($numeric > 0) {
                $initialReadings[$cleanMeterNo] = $numeric;
            }
        }

        $this->command->info('Seeding initial meter readings from customers.json...');

        foreach ($meters as $meter) {
            $meterKey = $meter->meter_number;

            if (!array_key_exists($meterKey, $initialReadings)) {
                continue;
            }

            $initial = $initialReadings[$meterKey];

            MeterReading::create([
                'customer_id' => $meter->customer_id,
                'meter_id' => $meter->id,
                'reading_date' => now()->subMonths(2),
                'current_reading' => $initial,
                'previous_reading' => $initial,
                'is_initial' => true,
                'read_by' => 1,
                'status' => 'paid',
            ]);
        }
    }
}

