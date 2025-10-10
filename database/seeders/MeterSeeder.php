<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meter;

class MeterSeeder extends Seeder
{
    public function run(): void
    {
        // Meter specifications with different sizes and models
        $meterSpecs = [
            ['size' => '15mm', 'model' => 'WM-15A', 'manufactory' => 'AquaTech'],
            ['size' => '20mm', 'model' => 'WM-20B', 'manufactory' => 'FlowMaster'],
            ['size' => '25mm', 'model' => 'WM-25C', 'manufactory' => 'AquaTech'],
            ['size' => '32mm', 'model' => 'WM-32D', 'manufactory' => 'WaterPro'],
            ['size' => '40mm', 'model' => 'WM-40E', 'manufactory' => 'WaterPro'],
            ['size' => '50mm', 'model' => 'WM-50F', 'manufactory' => 'FlowMaster'],
        ];

        // Status distribution
        $statuses = ['active', 'inactive', 'maintenance', 'damaged'];
        $statusWeights = [70, 15, 10, 5]; // 70% active, 15% inactive, 10% maintenance, 5% damaged

        $this->command->info('Generating 66,800 meters with serial numbers SSUW/ZH/JB/2310000001 to SSUW/ZH/JB/23100066800...');

        // Generate 66,800 meters
        $totalMeters = 66800;
        $batchSize = 1000; // Process in batches to avoid memory issues

        for ($batch = 0; $batch < ceil($totalMeters / $batchSize); $batch++) {
            $meters = [];
            $startNumber = ($batch * $batchSize) + 1;
            $endNumber = min(($batch + 1) * $batchSize, $totalMeters);

            for ($i = $startNumber; $i <= $endNumber; $i++) {
                // Generate serial number: SSUW/ZH/JB/2310000001, SSUW/ZH/JB/2310000002, etc.
                $serialNumber = 'SSUW/ZH/JB/231' . str_pad($i, 7, '0', STR_PAD_LEFT);
                
                // Randomly select meter specifications
                $spec = $meterSpecs[array_rand($meterSpecs)];
                
                // Randomly select status based on weights
                $status = $this->getWeightedRandomStatus($statuses, $statusWeights);

                $meters[] = [
                    'serial' => $serialNumber,
                    'status' => $status,
                    'size' => $spec['size'],
                    'model' => $spec['model'],
                    'manufactory' => $spec['manufactory'],
                ];
            }

            // Insert batch
            foreach ($meters as $meter) {
                Meter::firstOrCreate(
                    ['serial' => $meter['serial']],
                    $meter
                );
            }

            // Show progress
            $this->command->info("Generated meters {$startNumber} to {$endNumber} of {$totalMeters}");
        }

        $this->command->info('Meter generation completed!');
    }

    /**
     * Get a random status based on weights
     */
    private function getWeightedRandomStatus($statuses, $weights)
    {
        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($statuses as $index => $status) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $status;
            }
        }
        
        return $statuses[0]; // Fallback to first status
    }
}
