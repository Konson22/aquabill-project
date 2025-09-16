<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Customer Service',
                'Billing',
                'Field Operations',
                'Maintenance',
                'Procurement',
                'Administration',
                'IT',
            ]),
        ];
    }
}


