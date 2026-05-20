<?php

namespace Database\Seeders;

use App\Models\SupplyDay;
use App\Models\SupplyHistory;
use App\Models\SupplySchedule;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SupplyScheduleSeeder extends Seeder
{
    /**
     * Ensure every zone has an active weekly supply schedule and seed demo supply history.
     */
    public function run(): void
    {
        $mondayId = SupplyDay::query()->where('name', 'Monday')->where('status', 'active')->value('id');

        if ($mondayId === null) {
            throw new \RuntimeException('SupplyScheduleSeeder requires supply_days migration: no active Monday.');
        }

        $effectiveFrom = now()->toDateString();

        Zone::query()->each(function (Zone $zone) use ($mondayId, $effectiveFrom): void {
            if ($zone->supplySchedules()->active()->exists()) {
                return;
            }

            SupplySchedule::query()->create([
                'zone_id' => $zone->id,
                'supply_day_id' => $mondayId,
                'start_time' => '08:00:00',
                'end_time' => null,
                'effective_from' => $effectiveFrom,
                'effective_to' => null,
            ]);
        });

        $this->seedDemoSupplyHistories($mondayId);
    }

    private function seedDemoSupplyHistories(int $mondayId): void
    {
        $zone = Zone::query()->where('name', 'Jebel')->first();

        if ($zone === null) {
            return;
        }

        $scheduleId = $zone->supplySchedules()->active()->value('id');

        foreach ([3, 2, 1] as $weeksAgo) {
            $suppliedOn = Carbon::now()->startOfWeek()->subWeeks($weeksAgo)->toDateString();

            SupplyHistory::query()->firstOrCreate(
                [
                    'zone_id' => $zone->id,
                    'supplied_on' => $suppliedOn,
                    'kind' => 'scheduled',
                ],
                [
                    'supply_day_id' => $mondayId,
                    'supply_schedule_id' => $scheduleId,
                    'start_time' => '08:00:00',
                    'end_time' => null,
                    'notes' => null,
                    'recorded_by' => null,
                ],
            );
        }
    }
}
