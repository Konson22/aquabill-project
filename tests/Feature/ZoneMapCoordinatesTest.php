<?php

use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function sampleClosedPolygon(): array
{
    $lat = 4.8594;
    $lng = 31.5713;
    $d = 0.002;

    return [
        'type' => 'Polygon',
        'coordinates' => [[
            [$lng - $d, $lat - $d],
            [$lng + $d, $lat - $d],
            [$lng + $d, $lat + $d],
            [$lng - $d, $lat + $d],
            [$lng - $d, $lat - $d],
        ]],
    ];
}

test('zone can be created with GeoJSON polygon boundary', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('zones.store'), [
        'name' => 'Map Test Zone',
        'description' => null,
        'boundary_geojson' => sampleClosedPolygon(),
        'status' => 'active',
    ])->assertRedirect();

    $zone = Zone::query()->where('name', 'Map Test Zone')->first();
    expect($zone)->not->toBeNull();
    expect($zone->boundary_geojson)->toBeArray();
    expect($zone->boundary_geojson['type'])->toBe('Polygon');
});

test('zone can be created without boundary', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('zones.store'), [
        'name' => 'No Boundary Zone',
        'description' => null,
        'status' => 'active',
    ])->assertRedirect();

    $zone = Zone::query()->where('name', 'No Boundary Zone')->first();
    expect($zone)->not->toBeNull();
    expect($zone->boundary_geojson)->toBeNull();
});

test('open ring is rejected for zone boundary', function () {
    $user = User::factory()->create();

    $openRing = [
        'type' => 'Polygon',
        'coordinates' => [[[31.0, 4.8], [31.1, 4.8], [31.05, 4.9]]],
    ];

    $this->actingAs($user)->post(route('zones.store'), [
        'name' => 'Bad Ring Zone',
        'boundary_geojson' => $openRing,
        'status' => 'active',
    ])->assertSessionHasErrors('boundary_geojson');
});

test('zone boundary can be updated via GIS patch route', function () {
    $user = User::factory()->create();
    $zone = Zone::factory()->create(['boundary_geojson' => null]);

    $this->actingAs($user)->patch(route('zones.boundary.update', $zone), [
        'boundary_geojson' => sampleClosedPolygon(),
    ])->assertRedirect();

    $zone->refresh();
    expect($zone->boundary_geojson)->toBeArray();
    expect($zone->boundary_geojson['type'])->toBe('Polygon');
});

test('invalid polygon is rejected on zone boundary patch', function () {
    $user = User::factory()->create();
    $zone = Zone::factory()->create();

    $openRing = [
        'type' => 'Polygon',
        'coordinates' => [[[31.0, 4.8], [31.1, 4.8], [31.05, 4.9]]],
    ];

    $this->actingAs($user)->patch(route('zones.boundary.update', $zone), [
        'boundary_geojson' => $openRing,
    ])->assertSessionHasErrors('boundary_geojson');
});
