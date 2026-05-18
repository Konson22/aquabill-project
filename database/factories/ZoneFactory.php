<?php

namespace Database\Factories;

use App\Models\SupplyDay;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Zone>
 */
class ZoneFactory extends Factory
{
    protected $model = Zone::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $withBoundary = fake()->boolean(70);
        $lat = fake()->latitude(4.5, 5.2);
        $lng = fake()->longitude(31.0, 32.0);
        $d = 0.003;

        return [
            'name' => fake()->unique()->words(3, true),
            'supply_day_id' => SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id'),
            'supply_time' => '08:00:00',
            'description' => null,
            'boundary_geojson' => $withBoundary ? [
                'type' => 'Polygon',
                'coordinates' => [[
                    [$lng - $d, $lat - $d],
                    [$lng + $d, $lat - $d],
                    [$lng + $d, $lat + $d],
                    [$lng - $d, $lat + $d],
                    [$lng - $d, $lat - $d],
                ]],
            ] : null,
            'status' => 'active',
        ];
    }
}
