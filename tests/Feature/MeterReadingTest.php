<?php

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it auto calculates consumption on create', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'previous_reading' => 100,
        'current_reading' => 150,
    ]);

    expect($reading->consumption)->toEqual(50);
});

test('it fetches previous reading from last reading if not provided', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    // Initial reading
    MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonth(),
        'previous_reading' => 0,
        'current_reading' => 100,
    ]);

    // New reading without previous_reading
    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'current_reading' => 180,
    ]);

    expect($reading->previous_reading)->toEqual(100);
    expect($reading->consumption)->toEqual(80);
});

test('it prevents negative consumption', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'previous_reading' => 100,
        'current_reading' => 50,
    ]);
})->throws(InvalidArgumentException::class);

test('readings index does not include initial readings', function () {
    $this->actingAs(User::factory()->create());

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-123456',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
        'status' => 'active',
    ]);

    $initial = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDays(2),
        'previous_reading' => 0,
        'current_reading' => 10,
        'is_initial' => true,
    ]);

    $normal = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDay(),
        'previous_reading' => 10,
        'current_reading' => 30,
        'is_initial' => false,
    ]);

    $response = $this->get('/readings');
    $response->assertOk();

    $ids = collect($response->viewData('page')['props']['readings']['data'] ?? [])->pluck('id')->all();

    expect($ids)->toContain($normal->id);
    expect($ids)->not->toContain($initial->id);
});
