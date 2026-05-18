<?php

use App\Models\Station;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\StationSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\ZoneSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('StationSeeder creates main branch linked to finance@gmail.com', function () {
    $this->seed([
        DepartmentSeeder::class,
        PermissionSeeder::class,
        RoleSeeder::class,
        UserSeeder::class,
        ZoneSeeder::class,
        StationSeeder::class,
    ]);

    $station = Station::query()->where('name', 'Main branch')->first();

    expect($station)->not->toBeNull();
    expect($station->accountant_id)->not->toBeNull();
    expect($station->accountant?->email)->toBe('finance@gmail.com');
});
