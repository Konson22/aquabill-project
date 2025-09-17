<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'admin',
            'manager',
            'staff',
        ];

        foreach ($roles as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
    }
}


