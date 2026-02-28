<?php

namespace Database\Seeders;

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
            // Admin department - 2 users
            [
                'name' => 'Admin User',
                'department' => 'admin',
                'password' => '123',
            ],
            [
                'name' => 'Finance User',
                'department' => 'finance',
                'password' => '123',
            ],
            [
                'name' => 'Meters User',
                'department' => 'meters',
                'password' => '123',
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['name' => $userData['name']],
                $userData
            );
        }
    }
}

