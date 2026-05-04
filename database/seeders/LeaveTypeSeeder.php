<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual leave', 'default_days_per_year' => 21, 'is_paid' => true, 'is_active' => true],
            ['name' => 'Sick leave', 'default_days_per_year' => 7, 'is_paid' => true, 'is_active' => true],
            ['name' => 'Maternity leave', 'default_days_per_year' => 90, 'is_paid' => true, 'is_active' => true],
            ['name' => 'Unpaid leave', 'default_days_per_year' => 0, 'is_paid' => false, 'is_active' => true],
        ];

        foreach ($types as $row) {
            LeaveType::create($row);
        }
    }
}
