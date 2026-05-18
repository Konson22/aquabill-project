<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

test('api bills index requires authentication', function () {
    $this->getJson('/api/bills')->assertUnauthorized();
});

test('api bills index returns paginated bills with balances', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 10,
    ]);
    $zone = Zone::query()->create([
        'name' => 'API Bills Zone',
        'status' => 'active',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'API Bill Customer',
        'phone' => '111222333',
        'address' => '1 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-API-BILL-1',
        'status' => 'active',
    ]);
    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'customer_id' => $customer->id,
        'reading_date' => '2026-05-01',
        'previous_reading' => 0,
        'current_reading' => 20,
    ]);

    $bill = Bill::query()->create([
        'bill_no' => 'API-BILL-001',
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'meter_number' => $meter->meter_number,
        'reading_id' => $reading->id,
        'consumption' => 20,
        'unit_price' => 50,
        'fixed_charge' => 10,
        'current_charge' => 1010,
        'previous_balance' => 0,
        'total_amount' => 1010,
        'status' => 'partial',
        'due_date' => now()->addDays(14)->toDateString(),
    ]);

    $bill->payments()->create([
        'amount' => 200,
        'current_balance' => 810,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/bills');

    $response->assertOk();
    $response->assertJsonPath('data.0.bill_no', 'API-BILL-001');
    $response->assertJsonPath('data.0.customer_name', 'API Bill Customer');
    $response->assertJsonPath('data.0.amount_paid', 200);
    $response->assertJsonPath('data.0.current_balance', 810);
    $response->assertJsonPath('data.0.reading.current_reading', 20);
});

test('api bills index can filter by customer_id', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 10,
    ]);
    $zone = Zone::query()->create([
        'name' => 'API Bills Zone 2',
        'status' => 'active',
    ]);

    $customerA = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Customer A',
        'phone' => '111',
        'address' => 'A',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    $customerB = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Customer B',
        'phone' => '222',
        'address' => 'B',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    $meterA = Meter::query()->create([
        'customer_id' => $customerA->id,
        'meter_number' => 'MTR-FILTER-A',
        'status' => 'active',
    ]);
    $meterB = Meter::query()->create([
        'customer_id' => $customerB->id,
        'meter_number' => 'MTR-FILTER-B',
        'status' => 'active',
    ]);
    $readingA = MeterReading::query()->create([
        'meter_id' => $meterA->id,
        'customer_id' => $customerA->id,
        'reading_date' => '2026-05-01',
        'previous_reading' => 0,
        'current_reading' => 1,
    ]);
    $readingB = MeterReading::query()->create([
        'meter_id' => $meterB->id,
        'customer_id' => $customerB->id,
        'reading_date' => '2026-05-01',
        'previous_reading' => 0,
        'current_reading' => 1,
    ]);

    Bill::query()->create([
        'bill_no' => 'BILL-A',
        'customer_id' => $customerA->id,
        'meter_id' => $meterA->id,
        'meter_number' => $meterA->meter_number,
        'reading_id' => $readingA->id,
        'consumption' => 1,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 1,
        'previous_balance' => 0,
        'total_amount' => 1,
        'status' => 'pending',
        'due_date' => now()->addDays(7)->toDateString(),
    ]);
    Bill::query()->create([
        'bill_no' => 'BILL-B',
        'customer_id' => $customerB->id,
        'meter_id' => $meterB->id,
        'meter_number' => $meterB->meter_number,
        'reading_id' => $readingB->id,
        'consumption' => 1,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 1,
        'previous_balance' => 0,
        'total_amount' => 1,
        'status' => 'pending',
        'due_date' => now()->addDays(7)->toDateString(),
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/bills?customer_id='.$customerA->id);

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    $response->assertJsonPath('data.0.bill_no', 'BILL-A');
});

test('api bills show returns a single bill with tariff', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'COMMERCIAL',
        'price_per_unit' => 75,
        'fixed_charge' => 25,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Show Bill Zone',
        'status' => 'active',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'commercial',
        'name' => 'Show Bill Customer',
        'phone' => '999888777',
        'address' => 'Plot 1',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-SHOW-BILL',
        'status' => 'active',
    ]);
    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'customer_id' => $customer->id,
        'reading_date' => '2026-05-01',
        'previous_reading' => 0,
        'current_reading' => 5,
    ]);

    $bill = Bill::query()->create([
        'bill_no' => 'SHOW-BILL-01',
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'meter_number' => $meter->meter_number,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 75,
        'fixed_charge' => 25,
        'current_charge' => 400,
        'previous_balance' => 50,
        'total_amount' => 450,
        'status' => 'pending',
        'due_date' => '2026-06-01',
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/bills/'.$bill->id);

    $response->assertOk();
    $response->assertJsonPath('bill_no', 'SHOW-BILL-01');
    $response->assertJsonPath('tariff.name', 'COMMERCIAL');
    $response->assertJsonPath('total_amount', 450);
    $response->assertJsonPath('previous_balance', 50);
});
