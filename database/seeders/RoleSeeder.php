<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = Permission::all();
        $viewBill = Permission::where('name', 'view_bill')->first();
        $createBill = Permission::where('name', 'create_bill')->first();
        $recordPayment = Permission::where('name', 'record_payment')->first();
        $viewReports = Permission::where('name', 'view_reports')->first();
        $manageUsers = Permission::where('name', 'manage_users')->first();
        $handleComplaints = Permission::where('name', 'handle_complaints')->first();

        $hrPermissionNames = [
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

        $hrPermissions = Permission::whereIn('name', $hrPermissionNames)->get();

        $roles = [
            'admin' => [
                'Super Admin' => $allPermissions,
                'System Admin' => $allPermissions,
            ],
            'finance' => [
                'Accountant' => [$viewBill, $recordPayment, $viewReports],
                'Cashier' => [$viewBill, $recordPayment],
            ],
            'ledger' => [
                'Billing Officer' => [$createBill, $viewBill, $viewReports],
                'Meter Reader' => [$viewBill],
            ],
            'hr' => [
                'HR Manager' => $hrPermissions->merge(collect([$manageUsers, $viewReports]))->unique('id')->values()->all(),
            ],
            'customer_care' => [
                'Agent' => [$viewBill, $handleComplaints],
                'Supervisor' => [$viewBill, $handleComplaints, $viewReports],
            ],
        ];

        foreach ($roles as $deptName => $deptRoles) {
            $department = Department::where('name', $deptName)->first();

            foreach ($deptRoles as $roleName => $permissions) {
                $role = Role::create([
                    'name' => $roleName,
                    'department_id' => $department->id,
                ]);

                $role->permissions()->attach(
                    collect($permissions)->pluck('id')->toArray()
                );
            }
        }
    }
}
