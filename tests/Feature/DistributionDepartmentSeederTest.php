<?php

use App\Models\Department;
use App\Models\User;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Support\Facades\Hash;

test('distribution department and seeded user exist after core seeders run', function () {
    $this->seed([
        DepartmentSeeder::class,
        PermissionSeeder::class,
        RoleSeeder::class,
        UserSeeder::class,
    ]);

    $dept = Department::query()->where('name', 'distribution')->first();
    expect($dept)->not->toBeNull();
    expect($dept->description)->toContain('distribution');

    $user = User::query()->where('email', 'distribution@gmail.com')->first();
    expect($user)->not->toBeNull();
    expect($user->department_id)->toBe($dept->id);
    expect(Hash::check('123', $user->password))->toBeTrue();
    expect($user->roles()->where('name', 'Distribution Officer')->exists())->toBeTrue();
});
