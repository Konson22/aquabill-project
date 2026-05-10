<?php

namespace Database\Factories;

use App\Models\Pipe;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pipe>
 */
class PipeFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $baseLat = 4.85941;
        $baseLng = 31.57125;

        return [
            'pipe_code' => 'P-'.fake()->unique()->numerify('######'),
            'zone_id' => Zone::query()->inRandomOrder()->value('id'),
            'pipe_type' => fake()->randomElement(['main', 'distribution', 'service']),
            'material' => fake()->randomElement(['PVC', 'Ductile iron', 'HDPE', 'Steel']),
            'diameter' => fake()->randomFloat(2, 50, 400),
            'length' => fake()->randomFloat(2, 20, 2000),
            'coordinates' => [
                [$baseLat, $baseLng],
                [$baseLat + 0.002, $baseLng + 0.002],
                [$baseLat + 0.004, $baseLng + 0.003],
            ],
            'status' => fake()->randomElement(['active', 'inactive', 'damaged', 'maintenance']),
            'installation_date' => fake()->optional()->date(),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
