<?php

use App\Models\SupplyHistory;
use App\Models\SupplySchedule;
use App\Models\Zone;
use Database\Seeders\SupplyScheduleSeeder;
use Database\Seeders\ZoneSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('SupplyScheduleSeeder creates active Monday schedule for each zone', function () {
    $this->seed(ZoneSeeder::class);

    (new SupplyScheduleSeeder)->run();

    $zone = Zone::query()->where('name', 'Jebel')->first();

    expect($zone)->not->toBeNull();
    expect(SupplySchedule::query()->where('zone_id', $zone->id)->active()->count())->toBe(1);
    expect(SupplySchedule::query()->where('zone_id', $zone->id)->active()->value('start_time'))->toBe('08:00:00');
});

test('SupplyScheduleSeeder is idempotent and seeds demo supply histories for Jebel', function () {
    $this->seed(ZoneSeeder::class);

    (new SupplyScheduleSeeder)->run();
    (new SupplyScheduleSeeder)->run();

    $zoneId = Zone::query()->where('name', 'Jebel')->value('id');

    expect(SupplySchedule::query()->where('zone_id', $zoneId)->active()->count())->toBe(1);
    expect(SupplyHistory::query()->where('zone_id', $zoneId)->where('kind', 'scheduled')->count())->toBe(3);
});
