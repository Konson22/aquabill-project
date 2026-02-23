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
                'password' => 'Konsonak@github2',
            ],
            [
                'name' => 'Admin User 2',
                'department' => 'admin',
                'password' => 'Konsonak@github2',
            ],
            // Finance department - 2 users
            [
                'name' => 'Finance User',
                'department' => 'finance',
                'password' => 'Konsonak@github2',
            ],
            [
                'name' => 'Finance User 2',
                'department' => 'finance',
                'password' => 'Konsonak@github2',
            ],
            // Meters department - 2 users
            [
                'name' => 'Meters User',
                'department' => 'meters',
                'password' => 'Konsonak@github2',
            ],
            [
                'name' => 'Meters User 2',
                'department' => 'meters',
                'password' => 'Konsonak@github2',
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

