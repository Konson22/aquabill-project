<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

test('api reading store persists mobile bill_no on reading and bill', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 10,
    ]);
    $zone = Zone::query()->create([
        'name' => 'API Zone Reading',
        'status' => 'active',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Reading API Customer',
        'phone' => '111222333',
        'address' => '1 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-API-READ-1',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/readings', [
        'customer_id' => $customer->id,
        'reading_date' => '2026-05-01',
        'current_reading' => 200,
        'bill_no' => 'MOBILE-BILL-001',
    ]);

    $response->assertCreated();
    $reading = MeterReading::query()->where('customer_id', $customer->id)->latest('id')->first();
    expect($reading)->not->toBeNull();
    expect($reading->bill_no)->toBe('MOBILE-BILL-001');

    $bill = Bill::query()->where('reading_id', $reading->id)->first();
    expect($bill)->not->toBeNull();
    expect($bill->bill_no)->toBe('MOBILE-BILL-001');
});

test('api reading store without bill_no lets server generate bill number', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 10,
    ]);
    $zone = Zone::query()->create([
        'name' => 'API Zone Reading 2',
        'status' => 'active',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Reading API Customer 2',
        'phone' => '444555666',
        'address' => '2 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-API-READ-2',
        'status' => 'active',
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/readings', [
        'customer_id' => $customer->id,
        'reading_date' => '2026-05-02',
        'current_reading' => 50,
    ]);

    $response->assertCreated();
    $reading = MeterReading::query()->where('customer_id', $customer->id)->latest('id')->first();
    expect($reading->bill_no)->toBeNull();

    $bill = Bill::query()->where('reading_id', $reading->id)->first();
    expect($bill)->not->toBeNull();
    expect($bill->bill_no)->toStartWith('BILL-');
});
