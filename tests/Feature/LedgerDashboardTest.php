<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\AppSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('ledger dashboard returns live stats from the database', function () {
    $this->seed(AppSettingSeeder::class);
    $ledgerDept = Department::query()->create([
        'name' => 'ledger',
        'description' => 'Ledger',
    ]);

    $user = User::factory()->create([
        'department_id' => $ledgerDept->id,
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);

    Zone::query()->create(['name' => 'Route A', 'status' => 'active']);
    Zone::query()->create(['name' => 'Route B', 'status' => 'inactive']);

    $zone = Zone::query()->create(['name' => 'Route C', 'status' => 'active']);

    $readCustomer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Read Customer',
        'phone' => '111',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'last_reading_date' => now(),
    ]);

    $unreadCustomer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Unread Customer',
        'phone' => '222',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'last_reading_date' => now()->subMonths(2),
    ]);

    $readMeter = Meter::query()->create([
        'customer_id' => $readCustomer->id,
        'meter_number' => 'MTR-001',
        'status' => 'active',
    ]);

    Meter::query()->create([
        'customer_id' => $unreadCustomer->id,
        'meter_number' => 'MTR-002',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $readMeter->id,
        'customer_id' => $readCustomer->id,
        'meter_number' => $readMeter->meter_number,
        'reading_date' => now(),
        'previous_reading' => 10,
        'current_reading' => 20,
        'consumption' => 10,
    ]);

    Bill::query()->create([
        'customer_id' => $readCustomer->id,
        'meter_id' => $readMeter->id,
        'meter_number' => $readMeter->meter_number,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 100,
        'fixed_charge' => 200,
        'current_charge' => 1200,
        'previous_balance' => 0,
        'total_amount' => 1200,
        'status' => 'pending',
        'due_date' => now()->addDays(14),
    ]);

    $response = $this->actingAs($user)->get(route('ledger'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('ledger/dashboard')
        ->where('stats.unread_meters', 1)
        ->where('stats.bills_generated', 1)
        ->where('stats.active_routes', 2)
        ->where('stats.pending_tasks', 1)
        ->has('billingCycle.period_start')
        ->has('billingCycle.period_end')
        ->where('billingCycle.readings_total', 2)
        ->where('billingCycle.readings_completed', 1)
        ->where('billingCycle.progress_percent', 50));
});

test('non-ledger user cannot access ledger dashboard', function () {
    $finance = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $finance->id,
    ]);

    $this->actingAs($user)->get(route('ledger'))->assertForbidden();
});
