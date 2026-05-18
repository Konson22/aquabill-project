<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Station;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('bill payment with station_id sets payments.station_id', function () {
    $user = User::factory()->create();
    $station = Station::factory()->create(['name' => 'Satellite A']);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Station Pay Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Station Pay Customer',
        'phone' => '100200300',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-ST',
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
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 25,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'station_id' => $station->id,
    ])->assertRedirect();

    $payment = Payment::query()->where('payable_type', Bill::class)->where('payable_id', $bill->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->station_id)->toBe($station->id);
    expect($payment->station)->not->toBeNull();
    expect($payment->station->is($station))->toBeTrue();
});

test('bill payment without station_id leaves station_id null', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'No Station Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'No Station Customer',
        'phone' => '200300400',
        'address' => '2 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-NS',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'Test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 5,
        'previous_balance' => 0,
        'total_amount' => 50,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ])->assertRedirect();

    $payment = Payment::query()->where('payable_type', Bill::class)->where('payable_id', $bill->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->station_id)->toBeNull();
});

test('bill payment rejects invalid station_id', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Invalid Station Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Invalid Station Customer',
        'phone' => '300400500',
        'address' => '3 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-INV',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'Test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 5,
        'previous_balance' => 0,
        'total_amount' => 50,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'station_id' => 999999,
    ])->assertSessionHasErrors('station_id');
});

test('bill payment requires station_id when at least one station exists', function () {
    $user = User::factory()->create();
    Station::factory()->create(['name' => 'Main Desk']);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Req Station Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Req Customer',
        'phone' => '100200300',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-REQ',
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
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 25,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'station_id' => null,
    ])->assertSessionHasErrors('station_id');
});

test('service charge confirm with station_id sets payments.station_id', function () {
    $user = User::factory()->create();
    $station = Station::factory()->create(['name' => 'Main desk']);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC-SC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'SC Station Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SC Station Customer',
        'phone' => '400500600',
        'address' => '4 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $type = ServiceChargeType::query()->create([
        'name' => 'Connection Fee',
        'code' => 'CONN',
        'amount' => 40,
    ]);

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $type->id,
        'amount' => 40,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($user)->post(route('service-charges.confirm-payment', $charge->id), [
        'payment_method' => 'cash',
        'station_id' => $station->id,
    ])->assertRedirect();

    $payment = Payment::query()->where('payable_type', ServiceCharge::class)->where('payable_id', $charge->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->station_id)->toBe($station->id);
});

test('service charge confirm requires station_id when stations exist', function () {
    $user = User::factory()->create();
    Station::factory()->create(['name' => 'Desk One']);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC-SC-REQ',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'SC Req Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SC Req Customer',
        'phone' => '400500600',
        'address' => '4 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $type = ServiceChargeType::query()->create([
        'name' => 'Connection Fee Req',
        'code' => 'CONNR',
        'amount' => 40,
    ]);

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $type->id,
        'amount' => 40,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($user)->post(route('service-charges.confirm-payment', $charge->id), [
        'payment_method' => 'cash',
    ])->assertSessionHasErrors('station_id');
});

test('payment with station exposes accountant user via station relation', function () {
    $user = User::factory()->create();
    $accountant = User::factory()->create([
        'name' => 'Jane Accountant',
        'email' => 'jane.accountant@example.test',
    ]);
    $station = Station::factory()->create([
        'accountant_id' => $accountant->id,
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Acct Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Acct Customer',
        'phone' => '600700800',
        'address' => '6 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-AC',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'Test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 5,
        'previous_balance' => 0,
        'total_amount' => 50,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'station_id' => $station->id,
    ])->assertRedirect();

    $payment = Payment::query()->where('payable_type', Bill::class)->where('payable_id', $bill->id)->first();
    $payment->load('station.accountant');

    expect($payment->station?->accountant)->not->toBeNull();
    expect($payment->station->accountant->is($accountant))->toBeTrue();
    expect($payment->station->accountant->name)->toBe('Jane Accountant');
    expect($payment->station->accountant->email)->toBe('jane.accountant@example.test');
});

test('bills index inertia includes stations', function () {
    $user = User::factory()->create();
    Station::factory()->create(['name' => 'Kiosk North']);

    $this->actingAs($user)->get(route('bills.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('bills/index')
            ->has('stations'));
});

test('service charges index inertia includes stations', function () {
    $user = User::factory()->create();
    Station::factory()->create(['name' => 'Field office']);

    $this->actingAs($user)->get(route('service-charges.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service-charges/index')
            ->has('stations'));
});
