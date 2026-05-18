<?php

namespace Database\Factories;

use App\Models\Station;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Station>
 */
class StationFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $suffix = fake()->unique()->numerify('####');

        return [
            'name' => 'Station '.$suffix,
            'zone_id' => null,
            'accountant_id' => null,
            'manager_name' => fake()->optional(0.4)->name(),
            'manager_phone' => fake()->optional(0.4)->numerify('09########'),
            'coordinate' => fake()->boolean(20)
                ? sprintf('%.6f,%.6f', fake()->latitude(), fake()->longitude())
                : null,
        ];
    }
}
