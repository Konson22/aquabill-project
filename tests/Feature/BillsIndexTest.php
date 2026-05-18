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
        'supply_day_id' => supplyDayId('Monday'),
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
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $bill->payments()->create([
        'amount' => 40,
        'current_balance' => 60.0,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $response = $this->actingAs($user)->get(route('bills.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('bills/index')
        ->has('bills.data', 1)
        ->where('bills.data.0.id', $bill->id)
        ->where('bills.data.0.amount_paid', '40.00')
        ->where('filters.search', ''));
});

test('bills index search filters by customer name, zone, meter number, phone, and bill number', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zoneAlpha = Zone::query()->create([
        'name' => 'SearchZoneAlpha',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $zoneBeta = Zone::query()->create([
        'name' => 'SearchZoneBeta',
        'supply_day_id' => supplyDayId('Tuesday'),
        'supply_time' => '09:00:00',
    ]);

    $customerAlpha = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SearchCustomerAlpha',
        'phone' => '555-ALPHA-SEARCH',
        'address' => '1 Alpha St',
        'zone_id' => $zoneAlpha->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $customerBeta = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SearchCustomerBeta',
        'phone' => '555-BETA-SEARCH',
        'address' => '2 Beta St',
        'zone_id' => $zoneBeta->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meterAlpha = Meter::query()->create([
        'customer_id' => $customerAlpha->id,
        'meter_number' => 'MTR-SEARCH-ALPHA-001',
        'status' => 'active',
    ]);

    $meterBeta = Meter::query()->create([
        'customer_id' => $customerBeta->id,
        'meter_number' => 'MTR-SEARCH-BETA-002',
        'status' => 'active',
    ]);

    $readingAlpha = MeterReading::query()->create([
        'meter_id' => $meterAlpha->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Test',
    ]);

    $readingBeta = MeterReading::query()->create([
        'meter_id' => $meterBeta->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'Test',
    ]);

    $billAlpha = Bill::query()->create([
        'customer_id' => $customerAlpha->id,
        'meter_id' => $meterAlpha->id,
        'reading_id' => $readingAlpha->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 100,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $billBeta = Bill::query()->create([
        'customer_id' => $customerBeta->id,
        'meter_id' => $meterBeta->id,
        'reading_id' => $readingBeta->id,
        'consumption' => 5,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 5,
        'previous_balance' => 0,
        'total_amount' => 50,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $billAlpha->refresh();

    $acting = $this->actingAs($user);

    $acting->get(route('bills.index', ['search' => 'SearchCustomerAlpha']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('bills.data', 1)
            ->where('bills.data.0.id', $billAlpha->id));

    $acting->get(route('bills.index', ['search' => 'SearchZoneAlpha']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('bills.data', 1)
            ->where('bills.data.0.id', $billAlpha->id));

    $acting->get(route('bills.index', ['search' => 'MTR-SEARCH-BETA-002']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('bills.data', 1)
            ->where('bills.data.0.id', $billBeta->id));

    $acting->get(route('bills.index', ['search' => '555-ALPHA-SEARCH']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('bills.data', 1)
            ->where('bills.data.0.id', $billAlpha->id));

    $acting->get(route('bills.index', ['search' => $billAlpha->bill_no]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('bills.data', 1)
            ->where('bills.data.0.id', $billAlpha->id));
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
        'supply_day_id' => supplyDayId('Monday'),
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
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $partialBill->payments()->create([
        'amount' => 40,
        'current_balance' => 60.0,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $this->actingAs($user)->post(route('bills.payments.store', $partialBill), [
        'amount' => 10,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ])->assertStatus(422);
});
