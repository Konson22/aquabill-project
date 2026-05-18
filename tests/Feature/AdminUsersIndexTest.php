<?php

use App\Models\Department;
use App\Models\Role;
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

test('admin can open create user page', function () {
    $admin = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);

    $user = User::factory()->create([
        'department_id' => $admin->id,
    ]);

    $this->actingAs($user)
        ->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/create')
            ->has('departments')
            ->has('roles'));
});

test('admin can create user and is redirected to index', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);

    $financeDept = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $adminUser = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

    $role = Role::query()->create([
        'name' => 'Billing Clerk',
        'department_id' => $financeDept->id,
    ]);

    $this->actingAs($adminUser)->post(route('users.store'), [
        'name' => 'New Staff',
        'email' => 'newstaff@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'department_id' => $financeDept->id,
        'roles' => [$role->id],
    ])->assertRedirect(route('users.index'));

    $created = User::query()->where('email', 'newstaff@example.com')->first();

    expect($created)->not->toBeNull();
    expect($created->roles->pluck('id')->all())->toContain($role->id);
});
