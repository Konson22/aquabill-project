<?php

use App\Models\Department;
use App\Models\HrDepartment;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('hr department user can access hr module pages', function () {
    $hrDept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $hrDept->id,
    ]);

    $this->actingAs($user);

    $this->get('/hr')->assertOk();
    $this->get('/hr/departments')->assertOk();
    $this->get('/hr/staff/create')->assertOk();
    $this->get('/hr/staff')->assertOk();
    $this->get('/hr/attendance')->assertOk();
    $this->get('/hr/leave')->assertOk();
    $this->get('/hr/payroll')->assertOk();
    $this->get('/hr/documents')->assertOk();
    $this->get('/hr/reports')->assertOk();
    $this->get('/hr/training/programs')->assertOk();
    $this->get('/hr/training/reports')->assertOk();
});

test('finance user cannot access hr staff index', function () {
    $financeDept = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $financeDept->id,
    ]);

    $this->actingAs($user)->get('/hr/staff')->assertForbidden();
});

test('hr user can view staff profile', function () {
    $hrDept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $hrDept->id,
    ]);

    $hrOrg = HrDepartment::query()->create([
        'name' => 'Test HR Unit',
        'code' => 'THU',
        'description' => null,
        'is_active' => true,
    ]);

    $staff = Staff::query()->create([
        'hr_department_id' => $hrOrg->id,
        'employee_number' => 'T-001',
        'name' => 'Test Employee',
        'status' => 'active',
    ]);

    $this->actingAs($user)->get('/hr/staff/'.$staff->id)->assertOk();
});
