<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage_users',
            'create_bill',
            'view_bill',
            'record_payment',
            'view_reports',
            'handle_complaints',
            'view_hr_dashboard',
            'manage_departments',
            'manage_staff',
            'manage_attendance',
            'manage_leave',
            'approve_leave',
            'manage_payroll',
            'manage_staff_documents',
            'view_hr_reports',
            'view_training',
            'manage_training_programs',
            'manage_training_participants',
            'manage_training_documents',
            'view_training_reports',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
