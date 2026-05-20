<?php

namespace Database\Factories;

use App\Models\SupplyDay;
use App\Models\SupplySchedule;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplySchedule>
 */
class SupplyScheduleFactory extends Factory
{
    protected $model = SupplySchedule::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'zone_id' => Zone::factory(),
            'supply_day_id' => SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id'),
            'start_time' => '08:00:00',
            'end_time' => null,
            'effective_from' => now()->toDateString(),
            'effective_to' => null,
            'notes' => null,
        ];
    }
}
