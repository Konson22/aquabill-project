<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::firstOrCreate(['name' => 'Administration']);

        User::firstOrCreate(
            ['email' => 'admin@aquabill.local'],
            [
                'name' => 'System Administrator',
                'password' => 'password',
                'role' => 'admin',
                'department_id' => $department->id,
                'email_verified_at' => now(),
            ]
        );
    }
}


