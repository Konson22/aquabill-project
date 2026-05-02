<?php

use App\Models\Subzone;
use App\Models\Zone;
use Illuminate\Database\QueryException;

test('zone has many subzones', function () {
    $zone = Zone::factory()->create();
    $subzone = Subzone::factory()->for($zone)->create(['name' => 'North Block']);

    expect($zone->subzones)->toHaveCount(1);
    expect($subzone->zone->is($zone))->toBeTrue();
    expect($subzone->name)->toBe('North Block');
});

test('subzone names are unique within a zone', function () {
    $zone = Zone::factory()->create();

    Subzone::factory()->for($zone)->create(['name' => 'East']);

    expect(fn () => Subzone::factory()->for($zone)->create(['name' => 'East']))
        ->toThrow(QueryException::class);
});
