<?php

namespace Database\Factories;

use App\Models\SupplyDay;
use App\Models\SupplyHistory;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SupplyHistory>
 */
class SupplyHistoryFactory extends Factory
{
    protected $model = SupplyHistory::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'zone_id' => Zone::factory(),
            'supply_day_id' => SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id'),
            'supply_schedule_id' => null,
            'supplied_on' => now()->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => null,
            'kind' => 'scheduled',
            'notes' => null,
            'recorded_by' => null,
        ];
    }

    public function reserve(): static
    {
        return $this->state(fn () => [
            'supply_day_id' => SupplyDay::query()->where('name', 'Saturday')->where('status', 'active')->value('id'),
            'kind' => 'reserve',
        ]);
    }
}
