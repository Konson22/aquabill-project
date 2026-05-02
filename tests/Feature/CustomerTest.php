<?php

use App\Models\Customer;
use App\Models\Meter;
use App\Models\Subzone;
use App\Models\Tariff;
use App\Models\Zone;
use Database\Seeders\CustomerSeeder;
use Illuminate\Support\Facades\File;

test('it auto generates account number on creation', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create([
        'name' => 'Test Zone',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    expect($customer->account_number)->toBe('WTR-000001');
});

test('it increments account number for subsequent customers', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create([
        'name' => 'Test Zone',
    ]);

    $customer1 = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $customer2 = Customer::create([
        'customer_type' => 'commercial',
        'name' => 'Jane Smith',
        'phone' => '987654321',
        'address' => '456 Side St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    expect($customer1->account_number)->toBe('WTR-000001');
    expect($customer2->account_number)->toBe('WTR-000002');
});

test('customer belongs to a zone', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create([
        'name' => 'Test Zone',
    ]);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    expect($customer->zone->id)->toBe($zone->id);
    expect($customer->tariff->id)->toBe($tariff->id);
    expect($zone->customers)->toHaveCount(1);
    expect($tariff->customers)->toHaveCount(1);
});

test('customer seeder skips when seed file is missing', function () {
    putenv('CUSTOMERS_SEED_PATH='.base_path('__missing_customer_seed__.json'));

    Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    Zone::create([
        'name' => 'Gudele',
        'supply_day' => 'Sunday',
        'supply_time' => '06:00:00',
    ]);

    $this->seed(CustomerSeeder::class);

    expect(Customer::query()->count())->toBe(0);
});

test('customer seeder stores initial reading on meter from json', function () {
    $jsonPath = base_path('__customers_seed_test__.json');

    File::put($jsonPath, json_encode([
        [
            'meterNo' => 'SSUWC/ZH/JB/2310000001',
            'customerName' => 'Test Customer',
            'contractDate' => '2025-01-01',
            'area' => 'JEBEL',
            'housePlotNo' => '42B',
            'tariff' => 'DOMESTIC',
            'tel' => '926100009',
            'initialReading' => '41 ',
        ],
    ], JSON_THROW_ON_ERROR));

    putenv('CUSTOMERS_SEED_PATH='.$jsonPath);

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Jebel',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $this->seed(CustomerSeeder::class);

    $customer = Customer::query()->where('account_number', 'SSUWC/ZH/JB/2310000001')->first();
    expect($customer)->not->toBeNull();
    expect($customer->tariff_id)->toBe($tariff->id);
    expect($customer->zone_id)->toBe($zone->id);
    expect($customer->plot_no)->toBe('42B');

    $subzone = Subzone::query()->where('zone_id', $zone->id)->where('name', 'HAI GWONGOROKI')->first();
    expect($subzone)->not->toBeNull();

    $meter = Meter::query()->where('meter_number', 'SSUWC/ZH/JB/2310000001')->first();
    expect($meter)->not->toBeNull();
    expect($meter->customer_id)->toBe($customer->id);
    expect((float) $meter->last_reading)->toBe(41.0);
    expect($customer->fresh()->last_reading_date?->toDateString())->toBe('2025-01-01');
});
