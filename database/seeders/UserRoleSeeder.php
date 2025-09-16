<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Get the admin user from UserSeeder
        $adminUser = User::where('email', 'admin@aquabill.local')->first();
        
        if ($adminUser) {
            // Assign admin role to the admin user
            $adminUser->assignRole('admin');
            echo "Assigned admin role to: {$adminUser->name}\n";
        }

        // Assign roles to other users if they exist
        $users = User::where('email', '!=', 'admin@aquabill.local')->get();
        
        foreach ($users as $user) {
            // Randomly assign roles for testing
            $roles = ['manager', 'user'];
            $randomRole = $roles[array_rand($roles)];
            $user->assignRole($randomRole);
            echo "Assigned {$randomRole} role to: {$user->name}\n";
        }
    }
}
