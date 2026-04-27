<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminDept = Department::where('name', 'admin')->first();
        $financeDept = Department::where('name', 'finance')->first();
        $ledgerDept = Department::where('name', 'ledger')->first();
        $hrDept = Department::where('name', 'hr')->first();
        $customerCareDept = Department::where('name', 'customer_care')->first();

        // 1. Admin User
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123'),
            'department_id' => $adminDept->id,
            'status' => 'active',
        ]);
        $admin->roles()->attach(Role::where('name', 'Super Admin')->first()->id);

        // 2. Finance User
        $finance = User::create([
            'name' => 'John Finance',
            'email' => 'finance@gmail.com',
            'password' => Hash::make('123'),
            'department_id' => $financeDept->id,
            'status' => 'active',
        ]);
        $finance->roles()->attach(Role::where('name', 'Accountant')->first()->id);

        // 3. Ledger User
        $ledger = User::create([
            'name' => 'Larry Ledger',
            'email' => 'ledger@gmail.com',
            'password' => Hash::make('123'),
            'department_id' => $ledgerDept->id,
            'status' => 'active',
        ]);
        $ledger->roles()->attach(Role::where('name', 'Billing Officer')->first()->id);

        // 4. HR User
        $hr = User::create([
            'name' => 'Hannah HR',
            'email' => 'hr@gmail.com',
            'password' => Hash::make('123'),
            'department_id' => $hrDept->id,
            'status' => 'active',
        ]);
        $hr->roles()->attach(Role::where('name', 'HR Manager')->first()->id);

        // 5. Customer Care User
        $cc = User::create([
            'name' => 'Cathy Care',
            'email' => 'care@gmail.com',
            'password' => Hash::make('123'),
            'department_id' => $customerCareDept->id,
            'status' => 'active',
        ]);
        $cc->roles()->attach(Role::where('name', 'Agent')->first()->id);
    }
}
