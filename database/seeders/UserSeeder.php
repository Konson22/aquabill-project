<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Pisa',
                'department' => 'admin',
                'role' => 'manager',
                'password' => '123',
            ],
            [
                'name' => 'Jeniffer',
                'department' => 'finance',
                'role' => 'staff',
                'password' => '123',
            ],
            [
                'name' => 'Diana',
                'department' => 'meters',
                'role' => 'staff',
                'password' => '123',
            ],
        ];

        foreach ($users as $userData) {
            $departmentName = $userData['department'];
            unset($userData['department']);

            $department = Department::where('name', $departmentName)->first();
            $userData['department_id'] = $department?->id;

            User::firstOrCreate(
                ['name' => $userData['name']],
                $userData
            );
        }
    }
}

