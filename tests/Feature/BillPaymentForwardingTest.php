<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\Zone;
use App\Services\BillService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('generating a new bill forwards the customer last open bill', function () {
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
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-00001',
        'status' => 'active',
    ]);

    $reading1 = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonths(2)->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Seed',
    ]);

    $previousBill = Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading1->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 100,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $reading2 = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonth()->toDateString(),
        'previous_reading' => 10,
        'current_reading' => 20,
        'notes' => 'Seed',
    ]);

    $createdBill = app(BillService::class)->generateForMeter($meter);

    expect($previousBill->fresh()->status)->toBe('forwarded');
    expect($createdBill)->not->toBeNull();
    expect((float) $createdBill->previous_balance)->toBeGreaterThan(0.0);
});
