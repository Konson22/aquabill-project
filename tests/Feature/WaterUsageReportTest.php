<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia;

test('water usage report aggregates consumption from bills in date range', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'North',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-WU-01',
        'customer_type' => 'residential',
        'name' => 'Water User One',
        'phone' => '123456789',
        'address' => '1 River Rd',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-WU-01',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::parse('2026-03-15')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 25,
        'notes' => 'Seed',
    ]);

    $bill = Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 25,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 25,
        'previous_balance' => 0,
        'total_amount' => 25,
        'status' => 'pending',
        'due_date' => Carbon::parse('2026-04-15')->toDateString(),
    ]);

    $issued = Carbon::parse('2026-03-16 10:00:00');
    $bill->forceFill(['created_at' => $issued, 'updated_at' => $issued])->saveQuietly();

    $this->actingAs($user)
        ->get('/reports/water-usage?from=2026-03-01&to=2026-03-31')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/water-usage')
            ->where('summary.total_consumption', 25)
            ->where('summary.bills_count', 1)
            ->where('summary.avg_consumption', 25)
            ->has('chartData')
            ->has('chartMeta')
            ->where('chartMeta.granularity', 'day')
            ->has('zoneData')
            ->has('topConsumers'));
});
