<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Station;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('finance report page shows finance metrics from existing payment data', function () {
    $this->travelTo(Carbon::parse('2026-05-15'));

    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $financeUser = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 20,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Zone Revenue',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'account_number' => 'ACC-FIN-001',
        'customer_type' => 'residential',
        'name' => 'Finance Customer',
        'phone' => '12345',
        'address' => 'Road 1',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-FIN-001',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::parse('2026-05-01')->toDateString(),
        'previous_reading' => 10,
        'current_reading' => 20,
        'notes' => 'Finance test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 50,
        'fixed_charge' => 20,
        'current_charge' => 500,
        'previous_balance' => 0,
        'total_amount' => 520,
        'status' => 'partial',
        'due_date' => Carbon::parse('2026-05-10')->toDateString(),
    ]);
    $bill->forceFill([
        'updated_at' => Carbon::parse('2026-05-04 10:00:00'),
    ])->saveQuietly();

    $bill->payments()->create([
        'amount' => 200,
        'current_balance' => 320.0,
        'payment_date' => Carbon::parse('2026-05-04')->toDateString(),
        'payment_method' => 'cash',
    ]);

    $serviceChargeType = ServiceChargeType::query()->create([
        'name' => 'Reconnection',
        'code' => 'RCN',
        'amount' => 40,
    ]);

    ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $serviceChargeType->id,
        'amount' => 40,
        'issued_by' => $financeUser->id,
        'issued_date' => Carbon::parse('2026-05-05')->toDateString(),
        'status' => 'paid',
    ]);

    $this->actingAs($financeUser)
        ->get('/revenue-report')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('revenue-report/index')
            ->where('financeSummary.total_revenue_collected', 240)
            ->where('financeSummary.outstanding_bills', 320)
            ->where('financeSummary.overdue_bills', 1)
            ->has('overdueBills')
            ->has('overdueBillsMeta')
            ->has('monthlyCollectionSummary')
            ->has('zoneRevenueComparison')
            ->has('filterOptions.zones')
            ->has('filterOptions.tariffs')
            ->has('filterOptions.stations')
            ->has('filterOptions.customers')
            ->has('filterOptions.cashiers'));
});

test('finance reports route redirects to unified revenue report', function () {
    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $financeUser = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $this->actingAs($financeUser)
        ->get('/finance/reports?from=2026-01-01&to=2026-12-31')
        ->assertRedirect(route('revenue-report.index', [
            'month' => '2026-01',
        ]));
});

test('finance report filters by zone', function () {
    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $financeUser = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 20,
    ]);

    $zoneA = Zone::query()->create([
        'name' => 'Zone A',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $zoneB = Zone::query()->create([
        'name' => 'Zone B',
        'supply_day_id' => supplyDayId('Tuesday'),
        'supply_time' => '09:00:00',
    ]);

    $customerA = Customer::query()->create([
        'account_number' => 'ACC-ZA',
        'customer_type' => 'residential',
        'name' => 'Customer A',
        'phone' => '111',
        'address' => 'A',
        'zone_id' => $zoneA->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $customerB = Customer::query()->create([
        'account_number' => 'ACC-ZB',
        'customer_type' => 'residential',
        'name' => 'Customer B',
        'phone' => '222',
        'address' => 'B',
        'zone_id' => $zoneB->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meterA = Meter::query()->create([
        'customer_id' => $customerA->id,
        'meter_number' => 'MTR-ZA',
        'status' => 'active',
    ]);
    $meterB = Meter::query()->create([
        'customer_id' => $customerB->id,
        'meter_number' => 'MTR-ZB',
        'status' => 'active',
    ]);

    $readingA = MeterReading::query()->create([
        'meter_id' => $meterA->id,
        'reading_date' => Carbon::parse('2026-05-01')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'A',
    ]);
    $readingB = MeterReading::query()->create([
        'meter_id' => $meterB->id,
        'reading_date' => Carbon::parse('2026-05-01')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'B',
    ]);

    $billA = Bill::query()->create([
        'customer_id' => $customerA->id,
        'meter_id' => $meterA->id,
        'reading_id' => $readingA->id,
        'consumption' => 5,
        'unit_price' => 50,
        'fixed_charge' => 20,
        'current_charge' => 250,
        'previous_balance' => 0,
        'total_amount' => 270,
        'status' => 'partial',
        'due_date' => Carbon::parse('2026-06-10')->toDateString(),
    ]);

    $billA->payments()->create([
        'amount' => 100,
        'current_balance' => 170.0,
        'payment_date' => Carbon::parse('2026-05-15')->toDateString(),
        'payment_method' => 'cash',
    ]);

    $billB = Bill::query()->create([
        'customer_id' => $customerB->id,
        'meter_id' => $meterB->id,
        'reading_id' => $readingB->id,
        'consumption' => 5,
        'unit_price' => 50,
        'fixed_charge' => 20,
        'current_charge' => 250,
        'previous_balance' => 0,
        'total_amount' => 270,
        'status' => 'paid',
        'due_date' => Carbon::parse('2026-06-10')->toDateString(),
    ]);

    $billB->payments()->create([
        'amount' => 270,
        'current_balance' => 0.0,
        'payment_date' => Carbon::parse('2026-05-16')->toDateString(),
        'payment_method' => 'cash',
    ]);

    $this->actingAs($financeUser)
        ->get('/revenue-report?zone_id='.$zoneA->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('revenue-report/index')
            ->where('financeSummary.total_revenue_collected', 100)
            ->where('financeSummary.outstanding_bills', 170)
            ->where('financeSummary.payments_count', 1));
});

test('finance report filters by station', function () {
    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $financeUser = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 20,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Zone S',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $stationA = Station::factory()->create(['name' => 'Collection Desk A']);
    $stationB = Station::factory()->create(['name' => 'Collection Desk B']);

    $customerA = Customer::query()->create([
        'account_number' => 'ACC-SA',
        'customer_type' => 'residential',
        'name' => 'Customer SA',
        'phone' => '111',
        'address' => 'A',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $customerB = Customer::query()->create([
        'account_number' => 'ACC-SB',
        'customer_type' => 'residential',
        'name' => 'Customer SB',
        'phone' => '222',
        'address' => 'B',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meterA = Meter::query()->create([
        'customer_id' => $customerA->id,
        'meter_number' => 'MTR-SA',
        'status' => 'active',
    ]);
    $meterB = Meter::query()->create([
        'customer_id' => $customerB->id,
        'meter_number' => 'MTR-SB',
        'status' => 'active',
    ]);

    $readingA = MeterReading::query()->create([
        'meter_id' => $meterA->id,
        'reading_date' => Carbon::parse('2026-05-01')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'A',
    ]);
    $readingB = MeterReading::query()->create([
        'meter_id' => $meterB->id,
        'reading_date' => Carbon::parse('2026-05-01')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 5,
        'notes' => 'B',
    ]);

    $billA = Bill::query()->create([
        'customer_id' => $customerA->id,
        'meter_id' => $meterA->id,
        'reading_id' => $readingA->id,
        'consumption' => 5,
        'unit_price' => 50,
        'fixed_charge' => 20,
        'current_charge' => 250,
        'previous_balance' => 0,
        'total_amount' => 270,
        'status' => 'partial',
        'due_date' => Carbon::parse('2026-06-10')->toDateString(),
    ]);

    $billA->payments()->create([
        'amount' => 100,
        'current_balance' => 170.0,
        'payment_date' => Carbon::parse('2026-05-15')->toDateString(),
        'payment_method' => 'cash',
        'station_id' => $stationA->id,
    ]);

    $billB = Bill::query()->create([
        'customer_id' => $customerB->id,
        'meter_id' => $meterB->id,
        'reading_id' => $readingB->id,
        'consumption' => 5,
        'unit_price' => 50,
        'fixed_charge' => 20,
        'current_charge' => 250,
        'previous_balance' => 0,
        'total_amount' => 270,
        'status' => 'paid',
        'due_date' => Carbon::parse('2026-06-10')->toDateString(),
    ]);

    $billB->payments()->create([
        'amount' => 270,
        'current_balance' => 0.0,
        'payment_date' => Carbon::parse('2026-05-16')->toDateString(),
        'payment_method' => 'cash',
        'station_id' => $stationB->id,
    ]);

    $this->actingAs($financeUser)
        ->get('/revenue-report?station_id='.$stationA->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('revenue-report/index')
            ->where('financeSummary.total_revenue_collected', 100)
            ->where('financeSummary.payments_count', 1));
});

test('finance report export returns csv', function () {
    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $financeUser = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $response = $this->actingAs($financeUser)
        ->get('/finance/reports/export');

    $response->assertOk();
    expect((string) $response->headers->get('content-type'))->toStartWith('text/csv');
});
