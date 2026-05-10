<?php

namespace Database\Factories;

use App\Models\WaterPoint;
use App\Models\WaterPointType;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WaterPoint>
 */
class WaterPointFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'WP-'.fake()->unique()->numerify('#####'),
            'name' => fake()->company().' Water Point',
            'water_point_type_id' => WaterPointType::factory(),
            'zone_id' => Zone::query()->inRandomOrder()->value('id'),
            'latitude' => fake()->randomFloat(7, 4.82, 4.92),
            'longitude' => fake()->randomFloat(7, 31.52, 31.62),
            'manager_name' => fake()->name(),
            'manager_phone' => fake()->phoneNumber(),
            'status' => fake()->randomElement(['active', 'inactive', 'maintenance', 'damaged']),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
