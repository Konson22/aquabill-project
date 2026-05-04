<?php

use App\Models\Department;
use App\Models\HrDepartment;
use App\Models\User;

test('hr user can create an hr department', function () {
    $dept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    $user = User::factory()->create([
        'department_id' => $dept->id,
        'email_verified_at' => now(),
    ]);

    $response = $this->actingAs($user)->post('/hr/departments', [
        'name' => 'Legal',
        'code' => 'LEG',
        'description' => 'Compliance',
        'is_active' => true,
    ]);

    $response->assertRedirect('/hr/departments');

    expect(HrDepartment::query()->where('code', 'LEG')->exists())->toBeTrue();
});

test('non hr user cannot create an hr department', function () {
    $finance = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $finance->id,
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->post('/hr/departments', [
        'name' => 'Legal',
        'code' => 'LEG2',
        'description' => null,
        'is_active' => true,
    ])->assertForbidden();
});
