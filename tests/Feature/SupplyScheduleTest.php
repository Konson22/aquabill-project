<?php

use App\Models\SupplyDay;
use App\Models\SupplyHistory;
use App\Models\SupplySchedule;
use App\Models\Zone;
use Database\Seeders\AppSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(AppSettingSeeder::class);
});

test('supply schedules and histories tables exist with expected columns', function () {
    expect(Schema::hasColumns('supply_schedules', [
        'zone_id',
        'supply_day_id',
        'start_time',
        'effective_from',
        'effective_to',
    ]))->toBeTrue();

    expect(Schema::hasColumns('supply_histories', [
        'zone_id',
        'supplied_on',
        'kind',
    ]))->toBeTrue();

    expect(Schema::hasColumns('supply_days', ['is_reserve']))->toBeTrue();
});

test('saturday and sunday are marked as reserve supply days', function () {
    expect(SupplyDay::query()->where('name', 'Saturday')->value('is_reserve'))->toBeTrue();
    expect(SupplyDay::query()->where('name', 'Monday')->value('is_reserve'))->toBeFalse();
});

test('zone can have versioned schedule history', function () {
    $zone = Zone::createWithSupplySchedule(['name' => 'History Zone']);

    $mondayId = supplyDayId('Monday');

    SupplySchedule::query()
        ->where('zone_id', $zone->id)
        ->where('supply_day_id', $mondayId)
        ->update(['effective_to' => '2026-01-01']);

    SupplySchedule::query()->create([
        'zone_id' => $zone->id,
        'supply_day_id' => $mondayId,
        'start_time' => '09:00:00',
        'effective_from' => '2026-01-02',
        'effective_to' => null,
    ]);

    expect(SupplySchedule::query()->where('zone_id', $zone->id)->count())->toBe(2);
    expect(SupplySchedule::query()->where('zone_id', $zone->id)->active()->count())->toBe(1);
    expect(SupplySchedule::query()->where('zone_id', $zone->id)->active()->value('start_time'))->toBe('09:00:00');
});

test('reserve day supply history is recorded for any zone', function () {
    $zone = Zone::createWithSupplySchedule(['name' => 'Reserve Zone']);

    $history = $zone->recordSupplyHistory([
        'supplied_on' => '2026-05-18',
        'supply_day_id' => supplyDayId('Saturday'),
        'start_time' => '10:00:00',
    ]);

    expect($history->kind)->toBe('reserve');
    expect($history->zone_id)->toBe($zone->id);
    expect(SupplyHistory::query()->where('zone_id', $zone->id)->count())->toBe(1);
});
