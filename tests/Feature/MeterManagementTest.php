<?php

use App\Models\Customer;
use App\Models\Meter;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can create a meter without a customer', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('meters.store'), [
            'meter_number' => 'MTR-100001',
            'status' => 'active',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('meters', [
        'meter_number' => 'MTR-100001',
        'status' => 'active',
        'customer_id' => null,
    ]);
});

test('meters index can be filtered by search query', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 100,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone A',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'John Meter',
        'phone' => '12345678',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'ABC-001',
        'status' => 'active',
    ]);
    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'XYZ-009',
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('meters.index', ['search' => 'ABC']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.search', 'ABC')
        ->has('meters.data', 1)
        ->where('meters.data.0.meter_number', 'ABC-001'));
});

test('authenticated user can view a meter with reading history', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 50,
        'fixed_charge' => 100,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone A',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Jane Meter',
        'phone' => '12345678',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-SHOW-01',
        'last_reading' => 120.5,
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('meters.show', $meter));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('meters/show')
        ->where('meter.id', $meter->id)
        ->where('meter.meter_number', 'MTR-SHOW-01')
        ->has('readings'));
});

test('authenticated user can update meter details from the meters index', function () {
    $user = User::factory()->create();

    $meter = Meter::query()->create([
        'meter_number' => 'MTR-EDIT-01',
        'last_reading' => 10,
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('meters.update', $meter), [
            'meter_number' => 'MTR-EDIT-99',
            'last_reading' => 25.5,
            'status' => 'maintenance',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('meters', [
        'id' => $meter->id,
        'meter_number' => 'MTR-EDIT-99',
        'last_reading' => '25.50',
        'status' => 'maintenance',
    ]);
});

test('authenticated user can update meter status only', function () {
    $user = User::factory()->create();

    $meter = Meter::query()->create([
        'meter_number' => 'MTR-STATUS-01',
        'last_reading' => 10,
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('meters.update', $meter), [
            'status' => 'damage',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('meters', [
        'id' => $meter->id,
        'meter_number' => 'MTR-STATUS-01',
        'last_reading' => '10.00',
        'status' => 'damage',
    ]);
});
