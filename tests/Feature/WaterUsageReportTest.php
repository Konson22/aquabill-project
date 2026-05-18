<?php

use App\Exports\WaterUsageReportExport;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia;

test('water usage report aggregates consumption by meter reading date', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'North',
        'supply_day_id' => supplyDayId('Monday'),
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
        ->get('/water-report?month=2026-03')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('water-report/index')
            ->where('summary.total_consumption', 25)
            ->where('summary.bills_count', 1)
            ->where('summary.avg_consumption', 25)
            ->where('filters.month', '2026-03')
            ->has('chartData')
            ->where('chartMeta.granularity', 'day')
            ->has('zoneData')
            ->has('monthlyBreakdown')
            ->has('filterOptions.zones')
            ->has('filterOptions.tariffs')
            ->has('topConsumers'));
});

test('water usage report defaults to all months in the current calendar year', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Central',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-WU-ALL',
        'customer_type' => 'residential',
        'name' => 'All Months User',
        'phone' => '123456789',
        'address' => '1 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-WU-ALL',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::parse('2026-02-10')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 15,
        'notes' => 'Seed',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 15,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 15,
        'previous_balance' => 0,
        'total_amount' => 15,
        'status' => 'pending',
        'due_date' => Carbon::parse('2026-03-10')->toDateString(),
    ]);

    $this->actingAs($user)
        ->get('/water-report')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('filters.month', 'all')
            ->where('summary.total_consumption', 15)
            ->where('chartMeta.granularity', 'month')
            ->has('monthlyBreakdown', 12));
});

test('water usage report uses reading date not bill created date for month filter', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'South',
        'supply_day_id' => supplyDayId('Tuesday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-WU-02',
        'customer_type' => 'residential',
        'name' => 'Water User Two',
        'phone' => '123456780',
        'address' => '2 River Rd',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-WU-02',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => Carbon::parse('2026-03-10')->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 40,
        'notes' => 'Seed',
    ]);

    $bill = Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 40,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 40,
        'previous_balance' => 0,
        'total_amount' => 40,
        'status' => 'pending',
        'due_date' => Carbon::parse('2026-04-10')->toDateString(),
    ]);

    $issued = Carbon::parse('2026-04-20 10:00:00');
    $bill->forceFill(['created_at' => $issued, 'updated_at' => $issued])->saveQuietly();

    $this->actingAs($user)
        ->get('/water-report?month=2026-03')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_consumption', 40)
            ->where('summary.bills_count', 1));

    $this->actingAs($user)
        ->get('/water-report?month=2026-04')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_consumption', 0)
            ->where('summary.bills_count', 0));
});

test('water usage report can filter by zone and tariff', function () {
    $user = User::factory()->create();

    $tariffA = Tariff::create(['name' => 'DOMESTIC', 'price_per_unit' => 50, 'fixed_charge' => 0]);
    $tariffB = Tariff::create(['name' => 'COMMERCIAL', 'price_per_unit' => 80, 'fixed_charge' => 0]);

    $zoneA = Zone::create([
        'name' => 'East',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);
    $zoneB = Zone::create([
        'name' => 'West',
        'supply_day_id' => supplyDayId('Tuesday'),
        'supply_time' => '08:00:00',
    ]);

    foreach ([
        ['zone' => $zoneA, 'tariff' => $tariffA, 'consumption' => 10, 'account' => 'ACC-A'],
        ['zone' => $zoneB, 'tariff' => $tariffB, 'consumption' => 30, 'account' => 'ACC-B'],
    ] as $row) {
        $customer = Customer::create([
            'account_number' => $row['account'],
            'customer_type' => 'residential',
            'name' => $row['account'],
            'phone' => '123456789',
            'address' => '1 St',
            'zone_id' => $row['zone']->id,
            'tariff_id' => $row['tariff']->id,
            'status' => 'active',
        ]);

        $meter = Meter::create([
            'customer_id' => $customer->id,
            'meter_number' => 'M-'.$row['account'],
            'status' => 'active',
        ]);

        $reading = MeterReading::create([
            'meter_id' => $meter->id,
            'reading_date' => '2026-05-12',
            'previous_reading' => 0,
            'current_reading' => $row['consumption'],
            'notes' => 'Seed',
        ]);

        Bill::create([
            'customer_id' => $customer->id,
            'meter_id' => $meter->id,
            'reading_id' => $reading->id,
            'consumption' => $row['consumption'],
            'unit_price' => 1,
            'fixed_charge' => 0,
            'current_charge' => $row['consumption'],
            'previous_balance' => 0,
            'total_amount' => $row['consumption'],
            'status' => 'pending',
            'due_date' => '2026-06-12',
        ]);
    }

    $this->actingAs($user)
        ->get('/water-report?month=2026-05&zone_id='.$zoneB->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_consumption', 30)
            ->where('filters.zone_id', $zoneB->id));

    $this->actingAs($user)
        ->get('/water-report?month=2026-05&tariff_id='.$tariffA->id)
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('summary.total_consumption', 10)
            ->where('filters.tariff_id', $tariffA->id));
});

test('authenticated user can export water usage report as xlsx', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'EXPORT',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::create([
        'name' => 'Export Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::create([
        'account_number' => 'ACC-EXPORT',
        'customer_type' => 'residential',
        'name' => 'Export Customer',
        'phone' => '123456789',
        'address' => '1 St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-EXPORT',
        'status' => 'active',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => '2026-03-15',
        'previous_reading' => 0,
        'current_reading' => 12,
        'notes' => 'Seed',
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 12,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 12,
        'previous_balance' => 0,
        'total_amount' => 12,
        'status' => 'pending',
        'due_date' => '2026-04-15',
    ]);

    $response = $this->actingAs($user)->get(route('water-report.export', [
        'month' => '2026-03',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]));

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('attachment');
    expect($response->headers->get('content-disposition'))->toContain('water_usage_report_');
    expect($response->headers->get('content-type'))->toContain('spreadsheetml');
});

test('water usage export includes consumption by month table with totals and comparisons', function () {
    $export = new WaterUsageReportExport(
        summary: [
            'total_consumption' => 35,
            'avg_consumption' => 17.5,
            'bills_count' => 3,
        ],
        filters: [
            'month' => 'all',
            'zone_id' => null,
            'tariff_id' => null,
            'from' => '2026-01-01',
            'to' => '2026-12-31',
        ],
        chartData: [],
        chartMeta: ['granularity' => 'month'],
        zoneData: [],
        monthlyBreakdown: [
            [
                'month' => '2026-02',
                'label' => 'February 2026',
                'consumption' => 10,
                'bills_count' => 1,
            ],
            [
                'month' => '2026-03',
                'label' => 'March 2026',
                'consumption' => 25,
                'bills_count' => 2,
            ],
        ],
        topConsumers: [],
    );

    $monthlySheet = collect($export->sheets())->first(
        fn ($sheet) => $sheet->title() === 'Consumption by month',
    );

    expect($monthlySheet)->not->toBeNull();
    expect($monthlySheet->headings()[0])->toBe([
        'Month',
        'Volume (m³)',
        'Bills generated',
        'vs last month (volume · bills)',
    ]);
    expect($monthlySheet->array())->toBe([
        ['February 2026', 10.0, 1, '—'],
        ['March 2026', 25.0, 2, '+150.0% · +100.0%'],
        ['Total', 35.0, 3, ''],
    ]);
});
