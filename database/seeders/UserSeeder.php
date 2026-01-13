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
                'email' => 'admin@gmail.com',
                'department' => 'admin',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Admin User 2',
                'email' => 'admin2@gmail.com',
                'department' => 'admin',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
            // Finance department - 2 users
            [
                'name' => 'Finance User',
                'email' => 'finance@gmail.com',
                'department' => 'finance',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Finance User 2',
                'email' => 'finance2@gmail.com',
                'department' => 'finance',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
            // Meters department - 2 users
            [
                'name' => 'Meters User',
                'email' => 'meters@gmail.com',
                'department' => 'meters',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Meters User 2',
                'email' => 'meters2@gmail.com',
                'department' => 'meters',
                'password' => 'Konsonak@github2',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}

