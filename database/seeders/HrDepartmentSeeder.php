<?php

namespace Database\Seeders;

use App\Models\HrDepartment;
use Illuminate\Database\Seeder;

class HrDepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $hrDepartments = [
            [
                'name' => 'Recruitment',
                'code' => 'REC',
                'description' => 'Hiring, onboarding, and talent acquisition',
                'is_active' => true,
            ],
            [
                'name' => 'Training',
                'code' => 'TRN',
                'description' => 'Learning, development, and compliance training',
                'is_active' => true,
            ],
            [
                'name' => 'Payroll',
                'code' => 'PAY',
                'description' => 'Payroll processing and benefits administration',
                'is_active' => true,
            ],
            [
                'name' => 'Employee relations',
                'code' => 'ER',
                'description' => 'Workplace relations, policies, and grievances',
                'is_active' => true,
            ],
        ];

        foreach ($hrDepartments as $dept) {
            HrDepartment::create($dept);
        }
    }
}
