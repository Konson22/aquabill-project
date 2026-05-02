<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\Subzone;
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
        $tariffs = Tariff::all();

        if ($tariffs->isEmpty()) {
            return;
        }

        $zone = Zone::updateOrCreate(
            ['name' => 'Jebel'],
            [
                'supply_day' => 'Monday',
                'supply_time' => '08:00:00',
                'description' => 'Default zone for all customers.',
                'status' => 'active',
            ],
        );

        Subzone::updateOrCreate(
            [
                'zone_id' => $zone->id,
                'name' => 'HAI GWONGOROKI',
            ],
            [
                'status' => 'active',
            ],
        );

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

                    $connectionDate = $this->parseConnectionDate(Arr::get($row, 'contractDate'));
                    $initialReading = $this->parseInitialReading(Arr::get($row, 'initialReading'));

                    $customerAttributes = [
                        'customer_type' => $customerType,
                        'name' => $name,
                        'phone' => preg_replace('/\D+/', '', (string) Arr::get($row, 'tel', '')) ?: (string) Arr::get($row, 'tel', ''),
                        'email' => null,
                        'national_id' => null,
                        'address' => $address !== '' ? $address : $area,
                        'plot_no' => $housePlotNo !== '' ? $housePlotNo : null,
                        'zone_id' => $zone->id,
                        'tariff_id' => $tariff->id,
                        'connection_date' => $connectionDate,
                        'status' => 'active',
                    ];

                    if ($initialReading !== null && $initialReading > 0) {
                        $customerAttributes['last_reading_date'] = $connectionDate?->toDateString() ?? now()->toDateString();
                    }

                    $customer = Customer::updateOrCreate(
                        ['account_number' => $accountNumber],
                        $customerAttributes,
                    );

                    $meterAttributes = [
                        'customer_id' => $customer->id,
                        'status' => 'active',
                    ];

                    if ($initialReading !== null) {
                        $meterAttributes['last_reading'] = $initialReading;
                    }

                    Meter::updateOrCreate(
                        ['meter_number' => $accountNumber],
                        $meterAttributes,
                    );
                }
            }
        }
    }

    public function parseConnectionDate(mixed $value): ?Carbon
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
