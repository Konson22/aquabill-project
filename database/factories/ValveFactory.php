<?php

namespace Database\Factories;

use App\Models\Pipe;
use App\Models\Valve;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Valve>
 */
class ValveFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'valve_code' => 'V-'.fake()->unique()->numerify('#####'),
            'zone_id' => Zone::query()->inRandomOrder()->value('id'),
            'pipe_id' => Pipe::query()->inRandomOrder()->value('id'),
            'valve_type' => fake()->randomElement(['main', 'control', 'isolation', 'washout', 'air_release']),
            'latitude' => fake()->randomFloat(7, 4.82, 4.92),
            'longitude' => fake()->randomFloat(7, 31.52, 31.62),
            'status' => fake()->randomElement(['open', 'closed', 'damaged', 'maintenance']),
            'installation_date' => fake()->optional()->date(),
            'description' => fake()->optional()->sentence(),
        ];
    }
}
