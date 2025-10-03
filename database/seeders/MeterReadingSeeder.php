<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MeterReading;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\User;

class MeterReadingSeeder extends Seeder
{
    public function run(): void
    {
        // Get customers, meters, and users for relationships
        $customers = Customer::all();
        $meters = Meter::all();
        $users = User::all();

        if ($customers->isEmpty() || $meters->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Please run CustomerSeeder, MeterSeeder, and UserSeeder first.');
            return;
        }

        $readings = [];
        $currentDate = now();

        // Generate readings for the last 12 months for each customer
        foreach ($customers as $customer) {
            $customerMeter = $customer->meter;
            if (!$customerMeter) continue;

            $previousReading = 0;
            
            // Generate 12 months of readings
            for ($i = 11; $i >= 0; $i--) {
                $readingDate = $currentDate->copy()->subMonths($i);
                
                // Generate consumption between 5-50 cubic meters per month
                $consumption = rand(5, 50);
                $currentReading = $previousReading + $consumption;
                
                $readings[] = [
                    'customer_id' => $customer->id,
                    'meter_id' => $customerMeter->id,
                    'billing_officer' => $users->random()->id,
                    'value' => $currentReading,
                    'previous' => $previousReading,
                    'illigal_connection' => rand(0, 1), // Random 0 or 1
                    'note' => $this->getRandomNote(),
                    'source' => $this->getRandomSource(),
                    'date' => $readingDate->format('Y-m-d'),
                    'created_at' => $readingDate,
                    'updated_at' => $readingDate,
                ];
                
                $previousReading = $currentReading;
            }
        }

        // Insert readings in batches
        foreach (array_chunk($readings, 100) as $chunk) {
            MeterReading::insert($chunk);
        }
    }

    private function getRandomNote(): ?string
    {
        $notes = [
            'Regular reading',
            'Customer present during reading',
            'Meter in good condition',
            'No issues observed',
            'Customer requested reading',
            'Routine monthly reading',
            'Follow-up reading',
            'Meter replaced last month',
            'Customer complaint resolved',
            'Special reading requested',
            null, // Some readings may not have notes
        ];

        return $notes[array_rand($notes)];
    }

    private function getRandomSource(): ?string
    {
        $sources = [
            'Mobile App',
            'Field Officer',
            'Customer Self-Reading',
            'Automated System',
            'Manual Entry',
            'Phone Call',
            'Email',
            'SMS',
            'Web Portal',
            null, // Some readings may not have source
        ];

        return $sources[array_rand($sources)];
    }
}
