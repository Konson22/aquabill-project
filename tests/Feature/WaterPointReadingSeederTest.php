<?php

use App\Models\User;
use App\Models\WaterPoint;
use App\Models\WaterPointReading;
use Database\Seeders\WaterPointReadingSeeder;

test('water point reading seeder adds three readings per metered point', function () {
    User::factory()->create();
    $point = WaterPoint::factory()->create(['meter_no' => 'WM-TEST-1']);

    $this->seed(WaterPointReadingSeeder::class);

    expect(WaterPointReading::query()->where('water_point_id', $point->id)->count())->toBe(3);
    expect((float) WaterPointReading::query()->where('water_point_id', $point->id)->orderBy('reading_date')->first()->consumption)->toBe(100.0);
});

test('water point reading seeder is idempotent per water point', function () {
    User::factory()->create();
    WaterPoint::factory()->create(['meter_no' => 'WM-TEST-2']);

    $this->seed(WaterPointReadingSeeder::class);
    $this->seed(WaterPointReadingSeeder::class);

    expect(WaterPointReading::query()->count())->toBe(3);
});

test('water point reading seeder skips when no metered water points exist', function () {
    WaterPoint::factory()->create(['meter_no' => null]);

    $this->seed(WaterPointReadingSeeder::class);

    expect(WaterPointReading::query()->count())->toBe(0);
});
