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
                'HR Manager' => [$manageUsers, $viewReports],
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
