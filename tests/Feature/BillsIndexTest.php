<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('bills index includes summed payments for each bill', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Jebel',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Jane Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-00099',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 100,
        'amount_paid' => 40,
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $response = $this->actingAs($user)->get(route('bills.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('bills/index')
        ->has('bills.data', 1)
        ->where('bills.data.0.id', $bill->id)
        ->where('bills.data.0.amount_paid', '40.00'));
});

test('bill payment store rejects partial paid forwarded statuses', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC-PAY',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'ZonePay',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Pay Gate',
        'phone' => '123456789',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-PAY-GATE',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Test',
    ]);

    $partialBill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 100,
        'amount_paid' => 40,
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $partialBill), [
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ])->assertStatus(422);
});
