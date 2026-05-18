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

test('customer readings export downloads excel for the customer', function () {
    $user = User::factory()->create();
    $customer = makeCustomerForTabExport();

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-TAB-1',
        'status' => 'active',
    ]);

    MeterReading::query()->create([
        'meter_id' => $meter->id,
        'customer_id' => $customer->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 12,
        'consumption' => 12,
        'notes' => 'Export test',
    ]);

    $this->actingAs($user)
        ->get(route('customers.readings.export', $customer))
        ->assertOk()
        ->assertDownload();
});

test('customer payments export downloads excel for bills with payments', function () {
    $user = User::factory()->create();
    $customer = makeCustomerForTabExport();

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-TAB-2',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'customer_id' => $customer->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'consumption' => 10,
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
        'current_balance' => 60,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $this->actingAs($user)
        ->get(route('customers.payments.export', $customer))
        ->assertOk()
        ->assertDownload();
});

test('customer service charges export downloads excel for the customer', function () {
    $user = User::factory()->create();
    $customer = makeCustomerForTabExport();

    $type = ServiceChargeType::query()->create([
        'code' => 'RECON_FEE_TEST',
        'name' => 'Reconnection fee',
        'amount' => 500,
        'description' => 'Test charge type',
    ]);

    ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $type->id,
        'amount' => 500,
        'other_charges' => 0,
        'issued_date' => now()->toDateString(),
        'due_date' => now()->addDays(14)->toDateString(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($user)
        ->get(route('customers.service-charges.export', $customer))
        ->assertOk()
        ->assertDownload();
});

function makeCustomerForTabExport(): Customer
{
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

    return Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Tab Export Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
}
