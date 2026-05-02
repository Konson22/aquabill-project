<?php

namespace Database\Factories;

use App\Models\Subzone;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subzone>
 */
class SubzoneFactory extends Factory
{
    protected $model = Subzone::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'zone_id' => Zone::factory(),
            'name' => fake()->unique()->words(2, true),
            'description' => null,
            'status' => 'active',
        ];
    }
}
