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

        // Configure desired meter count and serial range
        $desiredCount = 800;
        $startSerialIndex = 66001;    // inclusive (produces 2310066001)
        $endSerialIndex = $startSerialIndex + $desiredCount - 1; // inclusive
        $totalMeters = $desiredCount;

        $this->command->info(
            'Generating ' . $totalMeters . ' meters with serial numbers SSUW/ZH/JB/231' .
            str_pad($startSerialIndex, 7, '0', STR_PAD_LEFT) . ' to SSUW/ZH/JB/231' .
            str_pad($endSerialIndex, 7, '0', STR_PAD_LEFT) . '...'
        );
        $batchSize = 1000; // Process in batches to avoid memory issues

        for ($batch = 0; $batch < ceil($totalMeters / $batchSize); $batch++) {
            $meters = [];
            // Compute actual serial index boundaries for this batch within the desired range
            $batchSerialStart = $startSerialIndex + ($batch * $batchSize);
            $batchSerialEnd = min($startSerialIndex + (($batch + 1) * $batchSize) - 1, $endSerialIndex);

            for ($serialIndex = $batchSerialStart; $serialIndex <= $batchSerialEnd; $serialIndex++) {
                // Generate serial number: SSUW/ZH/JB/2310006601 ... SSUW/ZH/JB/23100066800
                $serialNumber = 'SSUW/ZH/JB/231' . str_pad($serialIndex, 7, '0', STR_PAD_LEFT);
                
                // Randomly select meter size (model/manufactory will be N/A)
                $spec = $meterSpecs[array_rand($meterSpecs)];
                
                // Set all meters to inactive status
                $status = 'inactive';

                $meters[] = [
                    'serial' => $serialNumber,
                    'status' => $status,
                    'size' => $spec['size'],
                    'model' => 'N/A',
                    'manufactory' => 'N/A',
                ];
            }

            // Insert batch
            foreach ($meters as $meter) {
                Meter::firstOrCreate(
                    ['serial' => $meter['serial']],
                    $meter
                );
            }

            // Show progress (report relative progress within the total count)
            $relativeStart = ($batch * $batchSize) + 1;
            $relativeEnd = min(($batch + 1) * $batchSize, $totalMeters);
            $this->command->info("Generated meters {$relativeStart} to {$relativeEnd} of {$totalMeters}");
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
