<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
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
        $jsonPath = base_path('customers.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File not found: $jsonPath");
            return;
        }

        $customersData = json_decode(File::get($jsonPath), true);

        if (!is_array($customersData)) {
            $this->command->error("Invalid JSON format in $jsonPath");
            return;
        }

        $tariffs = Tariff::all();
        $domesticTariff = $tariffs->where('name', 'DOMESTIC')->first();

        // We only have one tariff (DOMESTIC), but keep
        // common variations mapped back to DOMESTIC.
        $tariffMap = [
            'DOMESTIC' => $domesticTariff,
            'DOMESTRIC' => $domesticTariff,
            'DOMESTI' => $domesticTariff,
            'DOESTIC' => $domesticTariff,
            'DOMESTICKI' => $domesticTariff,
            'GH' => $domesticTariff,
            'RE' => $domesticTariff,
            'PUB' => $domesticTariff,
        ];

        $defaultTariff = $domesticTariff ?? $tariffs->first();
        if (!$defaultTariff) {
            $defaultTariff = Tariff::create([
                'name' => 'DOMESTIC',
                'price' => 4000,
                'fixed_charge' => 2000,
                'description' => 'Default system tariff',
            ]);
        }

        $jebelZone = Zone::where('name', 'JEBEL SUK')->first();
        if (!$jebelZone) {
            $this->command->error('Zone "JEBEL SUK" not found. Run ZoneSeeder to create it before running this seeder.');
            return;
        }

        $otherZone = $jebelZone;
        $otherArea = Area::where('name', 'HAI GWONGOROKI')->first();

        if (!$otherArea) {
            $this->command->error('Area "HAI GWONGOROKI" not found. Run AreaSeeder to create it before running this seeder.');
            return;
        }

        $allAreas = Area::with('zone')->get();
        $reader = \App\Models\User::first();

        $this->command->info('Starting customer seeding from customers.json...');
        $bar = $this->command->getOutput()->createProgressBar(count($customersData));
        $bar->start();

        foreach ($customersData as $data) {
            $name = $data['customerName'] ?? 'Unknown Customer';
            $phone = $data['tel'] ?? null;

            if ($phone) {
                $phone = substr(preg_replace('/[^0-9]/', '', (string) $phone), 0, 15);
            }

            $addressBlock = trim($data['area'] ?? '');
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

            if (!str_starts_with(Str::upper($zone->name ?? ''), 'JEBEL')) {
                $bar->advance();
                continue;
            }

            $tariffName = Str::upper(trim((string) ($data['tariff'] ?? '')));
            $tariff = $tariffMap[$tariffName] ?? $defaultTariff;

            $customer = Customer::create([
                'name' => $name,
                'phone' => $phone,
                'zone_id' => $zone->id,
                'area_id' => $area->id,
                'tariff_id' => $tariff?->id,
                'address' => $addressBlock ?: 'No address provided',
                'plot_number' => (string) ($data['housePlotNo'] ?? ''),
                // Always ensure a non-null property_type (DB column is non-nullable)
                'property_type' => $tariffName !== '' ? $tariffName : 'RESIDENTIAL',
                'supply_status' => 'active',
            ]);

            $meterNumber = $data['meterNo'] ?? null;

            if ($meterNumber !== null && $meterNumber !== 0 && $meterNumber !== '0' && $meterNumber !== '') {
                $cleanMeterNumber = str_replace([' ', 'TRM'], '', (string) $meterNumber);
                $exists = Meter::where('meter_number', $cleanMeterNumber)->exists();
                $finalMeterNumber = $exists ? $cleanMeterNumber . '-' . $customer->id : $cleanMeterNumber;

                $meter = Meter::create([
                    'customer_id' => $customer->id,
                    'meter_number' => $finalMeterNumber,
                    'status' => 'active',
                ]);

                // Initial meter readings are now seeded exclusively
                // in MeterReadingSeeder using customers.json.
            }

            $depositRaw = $data['deposit'] ?? null;
            if ($depositRaw) {
                if (preg_match('/([\d.,]+)/', (string) $depositRaw, $matches)) {
                    $depositAmount = (float) str_replace(',', '', $matches[1]);
                } else {
                    $depositAmount = 0;
                }

                if ($depositAmount > 0) {
                    $invoice = Invoice::create([
                        'invoice_number' => 'DEP-' . str_pad((string) $customer->id, 8, '0', STR_PAD_LEFT),
                        'customer_id' => $customer->id,
                        'description' => 'Initial deposit for meter ' . ($meterNumber ?? ''),
                        'amount' => $depositAmount,
                        'due_date' => now(),
                        'status' => 'paid',
                    ]);

                    Payment::create([
                        'payable_type'    => Invoice::class,
                        'payable_id'      => $invoice->id,
                        'amount'          => $depositAmount,
                        'payable_total'   => $depositAmount,
                        'amount_paid'     => $depositAmount,
                        'balance_after'   => 0,
                        'payment_date'    => now(),
                        'payment_method'  => 'cash',
                        'reference_number'=> 'DEP-' . str_pad((string) $customer->id, 8, '0', STR_PAD_LEFT),
                        'received_by'     => 1,
                        'notes'           => 'Initial deposit payment from import',
                    ]);
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->info("\nSeeding of " . count($customersData) . " customers from customers.json completed successfully.");
    }
}
