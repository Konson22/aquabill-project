<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Administration department
        $department = Department::where('name', 'Administration')->first();
        
        if (!$department) {
            throw new \Exception('Administration department not found. Please run DepartmentSeeder first.');
        }

        // Get the admin role
        $adminRole = Role::where('name', 'admin')->first();
        
        if (!$adminRole) {
            throw new \Exception('Admin role not found. Please run RoleSeeder first.');
        }

        // Create the admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'System Administrator',
                'password' => 'Konsonak@github2',
                'department_id' => $department->id,
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to the user
        if (!$user->hasRole('admin')) {
            $user->assignRole('admin', $department->id);
        }
    }
}


