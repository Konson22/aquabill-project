<?php

use App\Models\Customer;
use App\Models\Department;
use App\Models\Tariff;
use App\Models\User;
use App\Models\WaterPoint;
use App\Models\WaterPointType;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Department::query()->firstOrCreate(
        ['name' => 'admin'],
        ['description' => 'Administration'],
    );
});

test('guests cannot access gis dashboard', function (): void {
    $this->get(route('gis.dashboard'))->assertRedirect(route('login'));
});

test('authenticated verified users can access gis dashboard', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->get(route('gis.dashboard'))->assertOk();
});

test('authenticated verified users can access gis map page', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->get(route('gis.map'))->assertOk();
});

test('authenticated verified users can access gis zone boundaries page', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->get(route('gis.zone-boundaries'))->assertOk();
});

test('authenticated users can list water points', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->get(route('gis.water-points.index'))->assertOk();
});

test('water point can be created with valid payload', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);
    $zone = Zone::factory()->create();
    $type = WaterPointType::factory()->create();

    $this->actingAs($user)->post(route('gis.water-points.store'), [
        'code' => 'WP-TEST-001',
        'name' => 'Test Point',
        'water_point_type_id' => $type->id,
        'zone_id' => $zone->id,
        'latitude' => 4.86,
        'longitude' => 31.57,
        'manager_name' => 'Supervisor',
        'manager_phone' => '+211900000',
        'status' => 'active',
        'description' => null,
    ])->assertRedirect(route('gis.water-points.index'));

    expect(WaterPoint::query()->where('code', 'WP-TEST-001')->exists())->toBeTrue();
});

test('sanctum user can fetch gis map data json', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    Sanctum::actingAs($user);

    $this->getJson('/api/gis/map-data')->assertOk()->assertJsonStructure([
        'filters',
        'water_points',
        'pipes',
        'valves',
        'customers',
    ]);
});

test('gis map data includes customers that have coordinates', function (): void {
    $dept = Department::query()->where('name', 'admin')->first();
    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $tariff = Tariff::query()->create([
        'name' => 'GIS MAP TARIFF',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);
    $zone = Zone::factory()->create();
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Map Customer',
        'phone' => '123456789',
        'address' => '1 GIS St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'latitude' => 4.85941,
        'longitude' => 31.57125,
    ]);

    Sanctum::actingAs($user);

    $payload = $this->getJson('/api/gis/map-data')->assertOk()->json('customers');
    $ids = collect($payload)->pluck('id')->all();

    expect($ids)->toContain($customer->id);
});
