<?php

namespace Database\Seeders;

use App\Models\Tariff;
use App\Models\TariffHistory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TariffHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tariffs = Tariff::all();
        $adminUsers = User::where('department', 'admin')->get();

        if ($tariffs->isEmpty()) {
            $this->command->warn('No tariffs found. Please run TariffSeeder first.');
            return;
        }

        if ($adminUsers->isEmpty()) {
            $this->command->warn('No admin users found. Please run UserSeeder first.');
            return;
        }

        foreach ($tariffs as $tariff) {
            // Create 2-3 historical versions of each tariff
            $numVersions = rand(2, 3);
            $currentDate = now();
            
            // Get the current tariff values
            $currentPrice = $tariff->price;
            $currentFixedCharge = $tariff->fixed_charge;
            
            // Create historical records going back in time
            for ($i = 0; $i < $numVersions; $i++) {
                $effectiveFrom = $currentDate->copy()->subMonths(($numVersions - $i - 1) * 6)->startOfMonth();
                $effectiveTo = $i === $numVersions - 1 ? null : $currentDate->copy()->subMonths(($numVersions - $i - 2) * 6)->startOfMonth();
                
                // Calculate price and fixed charge changes over time (prices generally increase)
                // Older versions have lower prices
                $priceMultiplier = 1 - (($numVersions - $i - 1) * 0.05); // 5% decrease per older version
                $fixedChargeMultiplier = 1 - (($numVersions - $i - 1) * 0.03); // 3% decrease per older version
                
                $historicalPrice = round($currentPrice * $priceMultiplier, 2);
                $historicalFixedCharge = round($currentFixedCharge * $fixedChargeMultiplier, 2);
                
                // Ensure values don't go negative
                $historicalPrice = max($historicalPrice, $currentPrice * 0.8);
                $historicalFixedCharge = max($historicalFixedCharge, $currentFixedCharge * 0.8);
                
                TariffHistory::create([
                    'tariff_id' => $tariff->id,
                    'name' => $tariff->name,
                    'price' => $historicalPrice,
                    'fixed_charge' => $historicalFixedCharge,
                    'description' => $tariff->description . ' (Historical version from ' . $effectiveFrom->format('M Y') . ')',
                    'effective_from' => $effectiveFrom,
                    'effective_to' => $effectiveTo,
                    'created_by' => $adminUsers->random()->id,
                ]);
            }
            
            // Also create the current version as history (if not already the latest)
            $latestHistory = TariffHistory::where('tariff_id', $tariff->id)
                ->whereNull('effective_to')
                ->latest('effective_from')
                ->first();
                
            if (!$latestHistory || $latestHistory->price != $currentPrice) {
                TariffHistory::create([
                    'tariff_id' => $tariff->id,
                    'name' => $tariff->name,
                    'price' => $currentPrice,
                    'fixed_charge' => $currentFixedCharge,
                    'description' => $tariff->description,
                    'effective_from' => $currentDate->copy()->startOfMonth(),
                    'effective_to' => null, // Current version
                    'created_by' => $adminUsers->random()->id,
                ]);
            }
        }
    }
}

