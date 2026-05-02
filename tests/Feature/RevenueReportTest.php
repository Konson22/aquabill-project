<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Inertia\Testing\AssertableInertia;

test('revenue report total revenue sums current charges without double counting carried balances', function () {
    $user = User::factory()->create();

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

    $customer = Customer::create([
        'account_number' => 'ACC-10001',
        'customer_type' => 'residential',
        'name' => 'Jane Revenue',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-REV-01',
        'status' => 'active',
    ]);

    $reading1 = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonths(2)->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Seed',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading1->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 100,
        'previous_balance' => 0,
        'total_amount' => 100,
        'status' => 'unpaid',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $serviceChargeType = ServiceChargeType::create([
        'name' => 'Reconnection',
        'code' => 'RCN',
        'amount' => 999,
    ]);

    ServiceCharge::create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $serviceChargeType->id,
        'amount' => 999,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    $reading2 = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonth()->toDateString(),
        'previous_reading' => 10,
        'current_reading' => 20,
        'notes' => 'Seed',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading2->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 40,
        'previous_balance' => 100,
        'total_amount' => 140,
        'status' => 'unpaid',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->has('summary')
            ->where('summary.total_revenue', 140));
});

test('revenue report total revenue respects customer search filter', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Zone A',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $alice = Customer::create([
        'account_number' => 'ACC-ALICE',
        'customer_type' => 'residential',
        'name' => 'Alice Alpha',
        'phone' => '111',
        'address' => 'A St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $bob = Customer::create([
        'account_number' => 'ACC-BOB',
        'customer_type' => 'residential',
        'name' => 'Bob Beta',
        'phone' => '222',
        'address' => 'B St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meterA = Meter::create(['customer_id' => $alice->id, 'meter_number' => 'M-A', 'status' => 'active']);
    $meterB = Meter::create(['customer_id' => $bob->id, 'meter_number' => 'M-B', 'status' => 'active']);

    $rA = MeterReading::create([
        'meter_id' => $meterA->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'x',
    ]);

    $rB = MeterReading::create([
        'meter_id' => $meterB->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'x',
    ]);

    Bill::create([
        'customer_id' => $alice->id,
        'meter_id' => $meterA->id,
        'reading_id' => $rA->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 300,
        'previous_balance' => 0,
        'total_amount' => 300,
        'status' => 'unpaid',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    Bill::create([
        'customer_id' => $bob->id,
        'meter_id' => $meterB->id,
        'reading_id' => $rB->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 700,
        'previous_balance' => 0,
        'total_amount' => 700,
        'status' => 'unpaid',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue?search='.urlencode('Alice'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->where('summary.total_revenue', 300));
});
