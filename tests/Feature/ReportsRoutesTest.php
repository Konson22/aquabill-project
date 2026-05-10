<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can open revenue report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/revenue')->assertOk();
});

test('authenticated user can open water usage report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/water-usage')->assertOk();
});

test('finance department user can open finance reports pages', function () {
    $financeDepartment = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $financeDepartment->id,
    ]);

    $this->actingAs($user);

    $this->get('/finance/reports')->assertOk();
    $this->get('/finance/reports/monthly')->assertOk();
});

test('non-finance user cannot open finance reports page', function () {
    $hrDepartment = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $hrDepartment->id,
    ]);

    $this->actingAs($user)->get('/finance/reports')->assertForbidden();
});
