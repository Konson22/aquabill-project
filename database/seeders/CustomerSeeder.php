<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = Zone::all();
        $tariffs = Tariff::all();

        if ($zones->isEmpty() || $tariffs->isEmpty()) {
            return;
        }

        $jsonPath = (string) (env('CUSTOMERS_SEED_PATH') ?: base_path('customer.json'));
        if (File::exists($jsonPath)) {
            $raw = File::get($jsonPath);
            $rows = json_decode($raw, true);

            if (is_array($rows)) {
                foreach ($rows as $row) {
                    if (! is_array($row)) {
                        continue;
                    }

                    $accountNumber = trim((string) Arr::get($row, 'meterNo', ''));
                    $name = trim((string) Arr::get($row, 'customerName', ''));

                    if ($accountNumber === '' || $name === '') {
                        continue;
                    }

                    $area = trim((string) Arr::get($row, 'area', ''));
                    $housePlotNo = trim((string) Arr::get($row, 'housePlotNo', ''));
                    $addressParts = array_values(array_filter([$area, $housePlotNo === '' ? null : 'Plot '.$housePlotNo]));
                    $address = $addressParts !== [] ? implode(', ', $addressParts) : $area;

                    $tariff = $tariffs->firstWhere('name', 'DOMESTIC') ?? $tariffs->first();
                    $customerType = 'residential';

                    $zone = $zones->firstWhere('name', 'Jebel') ?? $zones->first();

                    $connectionDate = $this->parseConnectionDate(Arr::get($row, 'contractDate'));

                    $customer = Customer::updateOrCreate(
                        ['account_number' => $accountNumber],
                        [
                            'customer_type' => $customerType,
                            'name' => $name,
                            'phone' => preg_replace('/\D+/', '', (string) Arr::get($row, 'tel', '')) ?: (string) Arr::get($row, 'tel', ''),
                            'email' => null,
                            'national_id' => null,
                            'address' => $address !== '' ? $address : $area,
                            'zone_id' => $zone->id,
                            'tariff_id' => $tariff->id,
                            'connection_date' => $connectionDate,
                            'status' => 'active',
                        ],
                    );

                    $meter = Meter::updateOrCreate(
                        ['meter_number' => $accountNumber],
                        [
                            'customer_id' => $customer->id,
                            'status' => 'active',
                        ],
                    );

                    $initialReading = $this->parseInitialReading(Arr::get($row, 'initialReading'));
                    if ($initialReading !== null) {
                        MeterReading::updateOrCreate(
                            [
                                'meter_id' => $meter->id,
                                'reading_date' => ($connectionDate ?? now())->toDateString(),
                            ],
                            [
                                'previous_reading' => 0,
                                'current_reading' => $initialReading,
                                'recorded_by' => null,
                                'notes' => 'Initial reading (seed)',
                                'is_initial' => true,
                            ],
                        );
                    }
                }
            }
        }
    }

   function parseConnectionDate(mixed $value): ?Carbon
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function parseInitialReading(mixed $value): ?float
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $normalized = str_replace(',', '', trim($value));
        if (! preg_match('/-?\d+(\.\d+)?/', $normalized, $matches)) {
            return null;
        }

        return (float) $matches[0];
    }
}
