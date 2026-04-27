<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'admin', 'description' => 'System administration and management'],
            ['name' => 'finance', 'description' => 'Financial operations and accounting'],
            ['name' => 'ledger', 'description' => 'Billing and meter reading management'],
            ['name' => 'hr', 'description' => 'Human resources and staff management'],
            ['name' => 'customer_care', 'description' => 'Customer support and complaints handling'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }
    }
}
