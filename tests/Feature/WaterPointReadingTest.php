<?php

use App\Models\User;
use App\Models\WaterPoint;
use App\Models\WaterPointReading;

test('water point reading fills previous reading consumption and meter_no from water point', function () {
    $point = WaterPoint::factory()->create([
        'meter_no' => 'WP-M-100',
    ]);

    $first = WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-05-01',
        'current_reading' => 100,
        'previous_reading' => null,
    ]);

    expect((float) $first->previous_reading)->toBe(0.0);
    expect((float) $first->consumption)->toBe(100.0);
    expect($first->meter_no)->toBe('WP-M-100');

    $second = WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-06-01',
        'current_reading' => 130,
        'previous_reading' => null,
    ]);

    expect((float) $second->previous_reading)->toBe(100.0);
    expect((float) $second->consumption)->toBe(30.0);
});

test('water point reading rejects current less than previous', function () {
    $point = WaterPoint::factory()->create();

    WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-05-01',
        'current_reading' => 50,
        'previous_reading' => null,
    ]);

    WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-06-01',
        'current_reading' => 40,
        'previous_reading' => null,
    ]);
})->throws(InvalidArgumentException::class);

test('water point has many readings relation', function () {
    $point = WaterPoint::factory()->create();
    WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-05-01',
        'current_reading' => 10,
        'previous_reading' => 0,
    ]);

    $point->load('readings');

    expect($point->readings)->toHaveCount(1);
});

test('water point reading stores recorded_by user', function () {
    $user = User::factory()->create();
    $point = WaterPoint::factory()->create();

    $reading = WaterPointReading::query()->create([
        'water_point_id' => $point->id,
        'reading_date' => '2026-05-01',
        'current_reading' => 5,
        'previous_reading' => 0,
        'recorded_by' => $user->id,
    ]);

    expect($reading->recorder)->not->toBeNull();
    expect($reading->recorder->is($user))->toBeTrue();
});
