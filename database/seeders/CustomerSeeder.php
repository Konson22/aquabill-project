<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
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
        $jsonPath = base_path('data/customers_output.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: $jsonPath");
            return;
        }

        $customersData = json_decode(File::get($jsonPath), true);

        if (!$customersData) {
            $this->command->error("Invalid JSON format in $jsonPath");
            return;
        }

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
            'HOTEL' => $tariffs->where('name', 'HOTEL')->first(),
            'OFFICE' => $tariffs->where('name', 'OFFICE')->first(),
        ];

        $defaultTariff = $tariffs->where('name', 'DOMESTIC')->first() ?? $tariffs->first();
        if (!$defaultTariff) {
            $defaultTariff = Tariff::create([
                'name' => 'DOMESTIC',
                'price' => 4000,
                'fixed_charge' => 2000,
                'description' => 'Default system tariff',
            ]);
        }

        $otherZone = Zone::where('name', 'OTHER')->first() ?? Zone::first();
        $otherArea = Area::where('name', 'JUBA TOWN')->first() ?? Area::first();

        if (!$otherZone || !$otherArea) {
            $this->command->error('At least one Zone and one Area must exist. Run Zone and Area seeders first.');
            return;
        }

        $allAreas = Area::with('zone')->get();
        $reader = \App\Models\User::first();

        $this->command->info('Starting customer seeding...');
        $bar = $this->command->getOutput()->createProgressBar(count($customersData));
        $bar->start();

        foreach ($customersData as $data) {
            $name = $data['CUS NAME'] ?? 'Unknown Customer';
            $phone = $data['TEL'] ?? null;

            if ($phone) {
                $phone = substr(preg_replace('/[^0-9]/', '', (string) $phone), 0, 15);
            }

            $addressBlock = trim($data['ADDRESS/BLOCK'] ?? '');
            $area = null;
            $zone = null;

            if (!empty($addressBlock)) {
                $area = $allAreas->where('name', $addressBlock)->first();

                if (!$area) {
                    $cleanAddress = str_replace('"', '', $addressBlock);
                    $area = $allAreas->where('name', $cleanAddress)->first();
                }

                if (!$area) {
                    $area = $allAreas->first(function ($a) use ($addressBlock) {
                        return str_contains(Str::upper($addressBlock), Str::upper($a->name));
                    });
                }

                if (!$area) {
                    $area = $allAreas->first(function ($a) use ($addressBlock) {
                        return str_contains(Str::upper($a->name), Str::upper($addressBlock));
                    });
                }

                if ($area) {
                    $zone = $area->zone;
                }
            }

            if (!$area) {
                $zone = $otherZone;
                $area = $otherArea;
            }

            $cusType = Str::upper(trim((string) ($data['CUS TYPE'] ?? '')));
            $tariff = $tariffMap[$cusType] ?? $defaultTariff;

            $customer = Customer::create([
                'name' => $name,
                'phone' => $phone,
                'zone_id' => $zone->id,
                'area_id' => $area->id,
                'tariff_id' => $tariff?->id,
                'address' => $addressBlock ?: 'No address provided',
                'plot_number' => (string) ($data['HOUSE /PLOT NO'] ?? ''),
                'property_type' => $cusType ?: null,
                'supply_status' => (isset($data['SUPPLY STATUS']) && Str::upper((string) $data['SUPPLY STATUS']) === 'WORKING') ? 'active' : 'inactive',
            ]);

            $meterNumber = $data['METER NO'] ?? null;

            if ($meterNumber !== null && $meterNumber !== 0 && $meterNumber !== '0' && $meterNumber !== '') {
                $cleanMeterNumber = str_replace([' ', 'TRM'], '', (string) $meterNumber);
                $exists = Meter::where('meter_number', $cleanMeterNumber)->exists();
                $finalMeterNumber = $exists ? $cleanMeterNumber . '-' . $customer->id : $cleanMeterNumber;

                $meter = Meter::create([
                    'customer_id' => $customer->id,
                    'meter_number' => $finalMeterNumber,
                    'status' => (isset($data['SUPPLY STATUS']) && Str::upper((string) $data['SUPPLY STATUS']) === 'WORKING') ? 'active' : 'inactive',
                ]);

                $currentReading = $data['current_reading'] ?? 0;
                if ($currentReading > 0) {
                    MeterReading::create([
                        'meter_id' => $meter->id,
                        'customer_id' => $customer->id,
                        'reading_date' => now()->subDay(),
                        'current_reading' => $currentReading,
                        'previous_reading' => 0,
                        'read_by' => $reader ? $reader->id : 1,
                        'status' => 'billed',
                    ]);
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->info("\nSeeding of " . count($customersData) . " customers completed successfully.");
    }
}
