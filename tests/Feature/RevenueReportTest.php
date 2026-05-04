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
use Carbon\Carbon;
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
        'status' => 'pending',
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
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->has('summary')
            ->where('summary.total_revenue', 140)
            ->where('summary.fixed_charge_revenue', 0)
            ->where('summary.total_billed_revenue', 140)
            ->where('summary.collection_rate_percent', 0)
            ->has('chartData', 12)
            ->has('overdueBills')
            ->has('overdueBillsMeta')
            ->where('overdueBillsMeta.total_count', 0));
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
        'status' => 'pending',
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
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue?search='.urlencode('Alice'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->where('summary.total_revenue', 300)
            ->where('summary.fixed_charge_revenue', 0)
            ->where('summary.total_billed_revenue', 300)
            ->where('summary.collection_rate_percent', 0)
            ->has('chartData', 12)
            ->has('overdueBills')
            ->has('overdueBillsMeta'));
});

test('revenue report fixed charge revenue sums tariff fixed fees on bills', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 10,
        'fixed_charge' => 25,
    ]);

    $zone = Zone::create([
        'name' => 'Zone X',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-FIX',
        'customer_type' => 'residential',
        'name' => 'Fixed Fee Customer',
        'phone' => '999',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-FIX',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'x',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 10,
        'fixed_charge' => 25,
        'current_charge' => 75,
        'previous_balance' => 0,
        'total_amount' => 75,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->where('summary.total_revenue', 75)
            ->where('summary.fixed_charge_revenue', 25)
            ->where('summary.total_billed_revenue', 100)
            ->where('summary.collection_rate_percent', 0)
            ->has('chartData', 12)
            ->has('overdueBills')
            ->has('overdueBillsMeta'));
});

test('revenue report includes overdue bill snapshot when bills are past due', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Zone Overdue',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-OD-EMBED',
        'customer_type' => 'residential',
        'name' => 'Embed Overdue Customer',
        'phone' => '1',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'M-OD-EMBED',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDays(10)->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 2,
        'notes' => 'x',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 2,
        'unit_price' => 10,
        'fixed_charge' => 0,
        'current_charge' => 20,
        'previous_balance' => 0,
        'total_amount' => 20,
        'status' => 'pending',
        'due_date' => now()->subDays(5)->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/reports/revenue')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->has('overdueBills', 1)
            ->where('overdueBillsMeta.total_count', 1)
            ->where('overdueBillsMeta.total_outstanding', 20)
            ->where('overdueBills.0.customer_name', 'Embed Overdue Customer')
            ->where('overdueBills.0.account_number', 'ACC-OD-EMBED')
            ->where('overdueBills.0.current_balance', 20));
});

test('revenue report chart monthly collection rate uses billed vs collected in that month', function () {
    $user = User::factory()->create();
    $year = (int) now()->year;

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Zone Chart CR',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-CHART-CR',
        'customer_type' => 'residential',
        'name' => 'Chart CR Customer',
        'phone' => '1',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'M-CHART-CR',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::create($year, 2, 10)->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'x',
    ]);

    $bill = Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 5,
        'unit_price' => 10,
        'fixed_charge' => 0,
        'current_charge' => 50,
        'previous_balance' => 0,
        'total_amount' => 50,
        'amount_paid' => 50,
        'status' => 'paid',
        'due_date' => Carbon::create($year, 2, 28)->toDateString(),
    ]);
    $bill->forceFill([
        'created_at' => Carbon::create($year, 2, 12, 12, 0, 0),
        'updated_at' => Carbon::create($year, 2, 12, 12, 0, 0),
    ])->saveQuietly();

    $from = sprintf('%d-01-01', $year);
    $to = sprintf('%d-12-31', $year);

    $this->actingAs($user)
        ->get('/reports/revenue?'.http_build_query(['from' => $from, 'to' => $to]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('reports/revenue')
            ->has('chartData', 12)
            ->where('chartData.1.collection_rate_percent', 100));
});
