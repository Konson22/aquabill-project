<?php

use App\Models\User;
use App\Models\Zone;

test('zones index includes water supply schedules and history', function () {
    $user = User::factory()->create();
    $zone = Zone::createWithSupplySchedule(['name' => 'Supply Test Zone']);

    $zone->recordSupplyHistory([
        'supplied_on' => now()->toDateString(),
        'supply_day_id' => supplyDayId('Saturday'),
        'start_time' => '09:30:00',
        'notes' => 'Reserve run',
    ]);

    $this->actingAs($user)
        ->get(route('zones.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('zones/index')
            ->has('zones', 1)
            ->has('waterSupplySchedules', 1)
            ->has('supplyHistories', 1)
            ->has('reserveDays')
            ->where('supplyHistories.0.kind', 'reserve')
            ->where('supplyHistories.0.notes', 'Reserve run'));
});

test('zones index shows empty water supply tables when no history', function () {
    $user = User::factory()->create();

    Zone::createWithSupplySchedule(['name' => 'Plan Only']);

    $this->actingAs($user)
        ->get(route('zones.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('zones/index')
            ->has('waterSupplySchedules', 1)
            ->has('supplyHistories', 0));
});
