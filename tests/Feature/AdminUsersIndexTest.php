<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin department user cannot access admin users index', function () {
    $finance = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $finance->id,
    ]);

    $this->actingAs($user)->get(route('users.index'))->assertForbidden();
});

test('admin department user can access admin users index', function () {
    $admin = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);

    $user = User::factory()->create([
        'department_id' => $admin->id,
    ]);

    $this->actingAs($user)->get(route('users.index'))->assertOk();
});
