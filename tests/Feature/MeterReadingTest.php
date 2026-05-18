<?php

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it auto calculates consumption on create', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'previous_reading' => 100,
        'current_reading' => 150,
    ]);

    expect($reading->consumption)->toEqual(50);
});

test('it fetches previous reading from last reading if not provided', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    // Initial reading
    MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonth(),
        'previous_reading' => 0,
        'current_reading' => 100,
    ]);

    // New reading without previous_reading
    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'current_reading' => 180,
    ]);

    expect($reading->previous_reading)->toEqual(100);
    expect($reading->consumption)->toEqual(80);
});

test('it prevents negative consumption', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
    ]);

    MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'previous_reading' => 100,
        'current_reading' => 50,
    ]);
})->throws(InvalidArgumentException::class);

test('readings index excludes opening readings where previous_reading is zero', function () {
    $this->actingAs(User::factory()->create());

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-123456',
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-001',
        'status' => 'active',
    ]);

    $initial = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDays(2),
        'previous_reading' => 0,
        'current_reading' => 10,
    ]);

    $normal = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDay(),
        'previous_reading' => 10,
        'current_reading' => 30,
    ]);

    $response = $this->get('/readings');
    $response->assertOk();

    $ids = collect($response->viewData('page')['props']['readings']['data'] ?? [])->pluck('id')->all();

    expect($ids)->toContain($normal->id);
    expect($ids)->not->toContain($initial->id);
});

test('overdue readings page lists active customers without a reading this month', function () {
    $this->actingAs(User::factory()->create());

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $overdueCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'Overdue Page Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-PAGE-OD',
        'status' => 'active',
        'last_reading_date' => now()->subMonths(2)->startOfMonth(),
    ]);

    Meter::create([
        'customer_id' => $overdueCustomer->id,
        'meter_number' => 'MTR-PAGE-OD',
        'status' => 'active',
    ]);

    $response = $this->get(route('readings.overdue'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('readings/overdue-readings')
            ->has('overdueCustomers.data', 1)
            ->where('overdueCustomers.data.0.name', 'Overdue Page Customer'));
});

test('readings index overdue tab lists active customers without a reading this month', function () {
    $this->actingAs(User::factory()->create());

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone']);

    $overdueCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'Overdue Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-OVERDUE',
        'status' => 'active',
        'last_reading_date' => now()->subMonths(2)->startOfMonth(),
    ]);

    Meter::create([
        'customer_id' => $overdueCustomer->id,
        'meter_number' => 'MTR-OVERDUE',
        'status' => 'active',
    ]);

    $currentCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'Current Customer',
        'phone' => '987654321',
        'address' => '456 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-CURRENT',
        'status' => 'active',
        'last_reading_date' => now()->startOfMonth(),
    ]);

    Meter::create([
        'customer_id' => $currentCustomer->id,
        'meter_number' => 'MTR-CURRENT',
        'status' => 'active',
    ]);

    $response = $this->get('/readings?tab=overdue');
    $response->assertOk();

    $ids = collect($response->viewData('page')['props']['overdueCustomers']['data'] ?? [])->pluck('id')->all();

    expect($ids)->toContain($overdueCustomer->id);
    expect($ids)->not->toContain($currentCustomer->id);
    expect($response->viewData('page')['props']['tabCounts']['overdue'])->toBe(1);
});

test('overdue readings export returns csv for customers without a reading this month', function () {
    $this->actingAs(User::factory()->create());

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Export Zone']);

    $overdueCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'Export Overdue Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'plot_no' => 'P-1',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-EXPORT-OD',
        'status' => 'active',
        'last_reading_date' => now()->subMonths(2)->startOfMonth(),
    ]);

    Meter::create([
        'customer_id' => $overdueCustomer->id,
        'meter_number' => 'MTR-EXPORT-OD',
        'status' => 'active',
    ]);

    Customer::create([
        'customer_type' => 'residential',
        'name' => 'Current Customer',
        'phone' => '987654321',
        'address' => '456 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'account_number' => 'WTR-CURRENT-OD',
        'status' => 'active',
        'last_reading_date' => now()->startOfMonth(),
    ]);

    $response = $this->get(route('readings.overdue.export'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');

    $content = $response->streamedContent();

    expect($content)
        ->toContain('Export Overdue Customer')
        ->toContain('WTR-EXPORT-OD')
        ->toContain('MTR-EXPORT-OD')
        ->not->toContain('Current Customer');
});

test('meter reassignment does not reuse previous customer last reading', function () {
    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);
    $zone = Zone::create(['name' => 'Test Zone']);

    $firstCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'First Customer',
        'phone' => '123456789',
        'address' => 'Address 1',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $secondCustomer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'Second Customer',
        'phone' => '987654321',
        'address' => 'Address 2',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $firstCustomer->id,
        'meter_number' => 'MTR-REASSIGN-001',
    ]);

    MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subDays(5),
        'previous_reading' => 0,
        'current_reading' => 120,
    ]);

    $meter->update(['customer_id' => $secondCustomer->id]);

    $newReading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'current_reading' => 35,
    ]);

    expect($newReading->previous_reading)->toEqual(0);
    expect((int) $newReading->customer_id)->toBe($secondCustomer->id);
});

test('web reading store accepts previous_reading from request', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone Web Store']);

    $customer = Customer::create([
        'account_number' => 'ACC-WEB-RD-1',
        'customer_type' => 'residential',
        'name' => 'Web Reader',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-WEB-01',
        'status' => 'active',
        'last_reading' => 100,
    ]);

    $this->actingAs($user)->post(route('readings.store'), [
        'meter_id' => $meter->id,
        'previous_reading' => 100,
        'current_reading' => 145,
        'reading_date' => now()->toDateString(),
        'notes' => 'ok',
    ])->assertRedirect();

    $reading = MeterReading::query()->where('meter_id', $meter->id)->latest('id')->first();

    expect($reading)->not->toBeNull();
    expect((float) $reading->previous_reading)->toBe(100.0);
    expect((float) $reading->current_reading)->toBe(145.0);
    expect((float) $reading->consumption)->toBe(45.0);
});

test('web reading store rejects current reading below submitted previous reading', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 500,
    ]);

    $zone = Zone::create(['name' => 'Test Zone Web Store 2']);

    $customer = Customer::create([
        'account_number' => 'ACC-WEB-RD-2',
        'customer_type' => 'residential',
        'name' => 'Web Reader Two',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-WEB-02',
        'status' => 'active',
    ]);

    $this->actingAs($user)->post(route('readings.store'), [
        'meter_id' => $meter->id,
        'previous_reading' => 100,
        'current_reading' => 80,
        'reading_date' => now()->toDateString(),
    ])->assertSessionHasErrors('current_reading');
});
