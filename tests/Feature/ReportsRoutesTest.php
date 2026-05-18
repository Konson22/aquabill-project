<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can open revenue report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/revenue-report')->assertOk();
});

test('legacy reports revenue url redirects to revenue report', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/revenue?from=2026-01-01&to=2026-12-31')
        ->assertRedirect(route('revenue-report.index', [
            'from' => '2026-01-01',
            'to' => '2026-12-31',
        ]));
});

test('authenticated user can open water report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/water-report')->assertOk();
});

test('legacy reports water usage url redirects to water report', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/water-usage?from=2026-03-01&to=2026-03-31')
        ->assertRedirect(route('water-report.index', [
            'month' => '2026-03',
        ]));
});

test('authenticated user can open payments report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/payments-report')->assertOk();
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

    $this->get('/finance/reports')->assertRedirect(route('revenue-report.index'));
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
