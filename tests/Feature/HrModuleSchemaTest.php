<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('hr module database schema is present', function () {
    expect(Schema::hasTable('hr_departments'))->toBeTrue();
    expect(Schema::hasTable('staff'))->toBeTrue();
    expect(Schema::hasTable('leave_types'))->toBeTrue();
    expect(Schema::hasTable('document_types'))->toBeTrue();
    expect(Schema::hasTable('staff_attendances'))->toBeTrue();
    expect(Schema::hasTable('staff_leave_requests'))->toBeTrue();
    expect(Schema::hasTable('staff_leave_balances'))->toBeTrue();
    expect(Schema::hasTable('payroll_periods'))->toBeTrue();
    expect(Schema::hasTable('staff_salaries'))->toBeTrue();
    expect(Schema::hasTable('payrolls'))->toBeTrue();
    expect(Schema::hasTable('payroll_adjustments'))->toBeTrue();
    expect(Schema::hasTable('staff_documents'))->toBeTrue();
});

test('staff table has expected columns', function () {
    expect(Schema::hasColumns('staff', [
        'hr_department_id',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'deleted_at',
    ]))->toBeTrue();
});

test('hr_departments table has code and is_active', function () {
    expect(Schema::hasColumns('hr_departments', ['code', 'is_active', 'deleted_at']))->toBeTrue();
});
