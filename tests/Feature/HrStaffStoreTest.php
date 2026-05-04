<?php

use App\Models\Department;
use App\Models\HrDepartment;
use App\Models\Staff;
use App\Models\User;

test('hr user can create staff and is redirected to profile', function () {
    $hrDept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $hrDept->id,
    ]);

    $org = HrDepartment::query()->create([
        'name' => 'Operations',
        'code' => 'OPS',
        'description' => null,
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post('/hr/staff', [
        'hr_department_id' => $org->id,
        'employee_number' => 'EMP-1001',
        'name' => 'Jane Worker',
        'phone' => '+123456789',
        'email' => 'jane@example.test',
        'job_title' => 'Technician',
        'status' => 'active',
        'hired_on' => '2026-01-15',
        'bank_name' => null,
        'bank_account_name' => null,
        'bank_account_number' => null,
        'notes' => null,
    ]);

    $staff = Staff::query()->where('employee_number', 'EMP-1001')->first();

    expect($staff)->not->toBeNull();

    $response->assertRedirect(route('hr.staff.show', $staff));

    expect($staff->name)->toBe('Jane Worker');
    expect($staff->hr_department_id)->toBe($org->id);
});

test('staff create validation requires name', function () {
    $hrDept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $hrDept->id,
    ]);

    $this->actingAs($user)->post('/hr/staff', [
        'name' => '',
        'status' => 'active',
    ])->assertSessionHasErrors('name');
});
