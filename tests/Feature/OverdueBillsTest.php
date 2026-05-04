<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('authenticated user can view overdue bills page', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('bills.overdue'))->assertOk();
});

test('overdue bills page only shows pending or partial bills with due_date in the past', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $tariff = Tariff::query()->create([
        'name' => 'TEST-TARIFF',
        'price_per_unit' => 1,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'TEST-ZONE',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Test Customer',
        'phone' => '000000000',
        'address' => 'Test Address',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'account_number' => 'WTR-999999',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-999999',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::today()->subDays(2),
        'previous_reading' => 0,
        'current_reading' => 10,
        'consumption' => 10,
        'recorded_by' => $user->id,
        'notes' => null,
    ]);

    $readingUpcoming = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::today()->subDay(),
        'current_reading' => 20,
        'recorded_by' => $user->id,
        'notes' => null,
    ]);

    $readingPaid = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::today(),
        'current_reading' => 30,
        'recorded_by' => $user->id,
        'notes' => null,
    ]);

    $overdue = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 10,
        'status' => 'pending',
        'due_date' => Carbon::today()->subDay(),
    ]);

    Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $readingUpcoming->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 10,
        'status' => 'pending',
        'due_date' => Carbon::today()->addDay(),
    ]);

    Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $readingPaid->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 10,
        'status' => 'paid',
        'due_date' => Carbon::today()->subDay(),
    ]);

    $response = $this->get(route('bills.overdue'));
    $response->assertOk();

    $bills = $response->viewData('page')['props']['bills']['data'] ?? [];
    $ids = collect($bills)->pluck('id')->all();

    expect($ids)->toContain($overdue->id);
    expect($ids)->toHaveCount(1);
});
