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
