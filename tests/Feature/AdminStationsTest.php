<?php

use App\Models\Department;
use App\Models\Station;
use App\Models\User;
use App\Models\Zone;

test('non-admin cannot access admin stations index', function () {
    $financeDept = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $financeDept->id,
    ]);

    $this->actingAs($user)->get(route('admin.stations.index'))->assertForbidden();
});

test('admin can open stations index inertia', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Administration',
    ]);

    $user = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

    $this->actingAs($user)
        ->get(route('admin.stations.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/stations/index')
            ->has('stations')
            ->has('zones')
            ->has('accountantChoices'));
});

test('admin can create a station', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Administration',
    ]);

    $user = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

    $accountant = User::factory()->create([
        'department_id' => $adminDept->id,
        'name' => 'Desk Accountant',
    ]);

    $zone = Zone::query()->create([
        'name' => 'Zone Admin Station',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $this->actingAs($user)->post(route('admin.stations.store'), [
        'name' => 'Main counter',
        'zone_id' => $zone->id,
        'accountant_id' => $accountant->id,
        'manager_name' => 'Site Lead',
        'manager_phone' => '0911122334',
        'coordinate' => '4.85,31.58',
    ])->assertRedirect();

    $station = Station::query()->where('name', 'Main counter')->first();

    expect($station)->not->toBeNull();
    expect($station->zone_id)->toBe($zone->id);
    expect($station->accountant_id)->toBe($accountant->id);
    expect($station->manager_name)->toBe('Site Lead');
    expect($station->manager_phone)->toBe('0911122334');
    expect($station->coordinate)->toBe('4.85,31.58');
});
