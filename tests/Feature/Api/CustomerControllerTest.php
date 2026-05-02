<?php

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

test('api customers index uses meter last_reading and customer last_reading_date', function () {
    $user = User::factory()->create();
    $zone = Zone::query()->create([
        'name' => 'Zone API Customer Test',
        'status' => 'active',
    ]);
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'API Customer',
        'phone' => '123456789',
        'address' => 'HAI GWONGOROKI, Plot 99',
        'plot_no' => 'P-99',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'last_reading_date' => '2026-01-10',
    ]);
    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-API-CUST-001',
        'last_reading' => 999.5,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/customers');

    $response->assertOk();
    $row = collect($response->json())->firstWhere('home_id', $customer->id);
    expect($row)->not->toBeNull();
    expect($row['account_number'])->toBe($customer->fresh()->account_number);
    expect($row['phone'])->toBe('123456789');
    expect($row['plot_number'])->toBe('P-99');
    expect($row['subzone'])->toBe('HAI GWONGOROKI');
    expect($row['latest_reading']['current_reading'])->toBe(999.5);
    expect($row['latest_reading']['reading_date'])->toBe('2026-01-10');
});

test('api customers reading_date prefers latest meter reading over stale customer last_reading_date', function () {
    $user = User::factory()->create();
    $zone = Zone::query()->create([
        'name' => 'Zone API Reading Date Test',
        'status' => 'active',
    ]);
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'API Customer 2',
        'phone' => '987654321',
        'address' => 'Other Address',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'last_reading_date' => '2026-01-01',
    ]);
    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-API-CUST-002',
        'last_reading' => 50,
        'status' => 'active',
    ]);
    MeterReading::query()->create([
        'meter_id' => $meter->id,
        'customer_id' => $customer->id,
        'meter_number' => $meter->meter_number,
        'reading_date' => '2026-03-20',
        'previous_reading' => 0,
        'current_reading' => 120,
        'consumption' => 120,
        'is_initial' => false,
    ]);
    $meter->refresh();
    $meter->forceFill([
        'last_reading' => 120,
    ])->saveQuietly();
    $customer->refresh();
    $customer->forceFill([
        'last_reading_date' => '2020-06-01',
    ])->saveQuietly();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/customers');

    $response->assertOk();
    $row = collect($response->json())->firstWhere('home_id', $customer->id);
    expect((float) $row['latest_reading']['current_reading'])->toBe(120.0);
    expect($row['latest_reading']['reading_date'])->toBe('2026-03-20');
    expect($row['subzone'])->toBeNull();
});
