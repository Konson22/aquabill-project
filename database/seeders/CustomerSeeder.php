<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Customer;
use App\Models\Home;
use App\Models\Meter;
use App\Models\Tariff;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('data/customers.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: $jsonPath");
            return;
        }

        $customersData = json_decode(File::get($jsonPath), true);
        
        if (!$customersData) {
            $this->command->error("Invalid JSON format in $jsonPath");
            return;
        }

        // Pre-fetch all tariffs and create a mapping
        $tariffs = Tariff::all();
        $tariffMap = [
            'C1' => $tariffs->where('name', 'C1')->first(),
            'C2' => $tariffs->where('name', 'C2')->first(),
            'C3' => $tariffs->where('name', 'C3')->first(),
            'C4' => $tariffs->where('name', 'C4')->first(),
            'DOMESTIC' => $tariffs->where('name', 'DOMESTIC')->first(),
            'DOMESTRIC' => $tariffs->where('name', 'DOMESTIC')->first(),
            'DOMESTI' => $tariffs->where('name', 'DOMESTIC')->first(),
            'DOESTIC' => $tariffs->where('name', 'DOMESTIC')->first(),
            'HTL' => $tariffs->where('name', 'HOTEL')->first(),
            'OFFICE' => $tariffs->where('name', 'OFFICE')->first(),
        ];
        
        $defaultTariff = $tariffs->first();
        if (!$defaultTariff) {
            $defaultTariff = Tariff::create([
                'name' => 'Default Tariff',
                'price' => 5.00,
                'fixed_charge' => 10.00,
                'description' => 'System created default tariff',
            ]);
        }

        $otherZone = Zone::where('name', 'OTHER')->first();
        $otherArea = Area::where('name', 'HAI KOSTI')->first() ?? Area::first();

        // Pre-fetch all areas to avoid repeated queries
        $areasMap = Area::all()->keyBy('name');
        
        // Find a reader for initial readings
        $reader = \App\Models\User::first();

        $this->command->info('Starting customer seeding...');
        $bar = $this->command->getOutput()->createProgressBar(count($customersData));
        $bar->start();

        foreach ($customersData as $data) {
            // 1. Find or create Customer
            $name = $data['CUS NAME'] ?? $data['cust_name'] ?? 'Unknown Customer';
            $phone = $data['TEL'] ?? null;
            
            if (is_string($phone)) {
                $phone = substr(preg_replace('/[^0-9]/', '', $phone), 0, 15);
            }

            $customer = Customer::create([
                'name' => $name,
                'phone' => $phone,
            ]);

            // 2. Map Area and Zone
            $addressBlock = $data['ADDRESS/BLOCK'] ?? null;
            $zoneNameFromData = $data['zone'] ?? null;
            
            $area = null;
            $zone = null;

            if ($addressBlock) {
                $area = $areasMap->get($addressBlock);
                
                if (!$area) {
                    // Try without quotes
                    $cleanAddress = str_replace('"', '', $addressBlock);
                    $area = $areasMap->first(function($a) use ($cleanAddress) {
                        return str_contains($a->name, $cleanAddress);
                    });
                }

                if ($area) {
                    $zone = $area->zone;
                }
            }

            // If we have a zone name in the data but couldn't find an area, try to find the zone at least
            if (!$zone && $zoneNameFromData) {
                $zone = Zone::where('name', $zoneNameFromData)->first();
            }

            // Fallback
            if (!$area) {
                $zone = $zone ?? $otherZone;
                $area = $otherArea;
            }

            // 3. Determine tariff based on customer type
            $cusType = Str::upper(trim($data['CUS TYPE'] ?? ''));
            $tariff = $tariffMap[$cusType] ?? $defaultTariff;

            // 4. Create Home
            $home = Home::create([
                'customer_id' => $customer->id,
                'zone_id' => $zone->id ?? ($otherZone->id ?? null),
                'area_id' => $area->id ?? ($otherArea->id ?? null),
                'tariff_id' => $tariff->id,
                'address' => $addressBlock ?? 'No address provided',
                'plot_number' => (string) ($data['HOUSE /PLOT NO'] ?? ''),
                'property_type' => $cusType ?: 'Residential',
            ]);

            // 5. Create Meter
            $meterNumber = $data['METER NO'] ?? $data['meter'] ?? null;
            if ($meterNumber !== null && $meterNumber !== 0 && $meterNumber !== "0" && $meterNumber !== "") {
                // Ensure meter number is unique for seeding
                $meterNumber = str_replace([' ', 'TRM'], '', $meterNumber) . '-' . $customer->id;

                $meter = Meter::create([
                    'home_id' => $home->id,
                    'meter_number' => (string) $meterNumber,
                    'status' => (isset($data['SUPPLY STATUS']) && Str::upper($data['SUPPLY STATUS']) === 'WORKING') ? 'active' : 'inactive',
                ]);

                // 6. Create Initial Reading
                $currentReading = $data['current_reading'] ?? 0;
                if ($currentReading > 0) {
                    \App\Models\MeterReading::create([
                        'meter_id' => $meter->id,
                        'home_id' => $home->id,
                        'reading_date' => now()->subDay(),
                        'current_reading' => $currentReading,
                        'previous_reading' => 0,
                        'read_by' => $reader ? $reader->id : 1,
                        'status' => 'billed', // Mark as billed as it's an initial data point
                    ]);
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->info("\nSeeding completed successfully.");
    }
}
