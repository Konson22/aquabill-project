<?php

namespace Database\Seeders;

use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\User;
use App\Services\BillService;
use Exception;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class MeterReadingSeeder extends Seeder
{
    /**
     * Billing cycles per meter (including the current period).
     */
    private const CYCLES_PER_METER = 3;

    public function run(): void
    {
        if (MeterReading::query()->exists()) {
            $this->command?->warn('Meter readings already exist. Skipping MeterReadingSeeder.');

            return;
        }

        $recorder = User::query()->orderBy('id')->first();

        if ($recorder === null) {
            $this->command?->warn('No users found. Skipping MeterReadingSeeder.');

            return;
        }

        $billService = app(BillService::class);
        $meters = Meter::query()
            ->where('status', 'active')
            ->whereNotNull('customer_id')
            ->with('customer.tariff')
            ->get();

        if ($meters->isEmpty()) {
            $this->command?->warn('No active meters with customers. Skipping MeterReadingSeeder.');

            return;
        }

        $readingsCreated = 0;
        $billsCreated = 0;

        foreach ($meters as $meter) {
            if ($meter->customer === null || $meter->customer->tariff === null) {
                continue;
            }

            $previous = (float) ($meter->last_reading ?? 0);

            for ($cycle = 0; $cycle < self::CYCLES_PER_METER; $cycle++) {
                $consumptionDelta = fake()->randomFloat(2, 8, 42);
                $current = round($previous + $consumptionDelta, 2);
                $readingDate = now()
                    ->subMonths(self::CYCLES_PER_METER - 1 - $cycle)
                    ->startOfMonth()
                    ->addDays(fake()->numberBetween(0, 20));

                MeterReading::query()->create([
                    'meter_id' => $meter->id,
                    'customer_id' => $meter->customer_id,
                    'meter_number' => $meter->meter_number,
                    'reading_date' => $readingDate,
                    'previous_reading' => $previous,
                    'current_reading' => $current,
                    'recorded_by' => $recorder->id,
                    'notes' => $cycle === self::CYCLES_PER_METER - 1
                        ? 'Latest seeded reading'
                        : 'Historical seeded reading',
                ]);

                $readingsCreated++;
                $previous = $current;

                try {
                    $bill = $billService->generateForMeter($meter->fresh(['customer.tariff']));

                    if ($bill !== null) {
                        $billsCreated++;
                    }
                } catch (Exception $exception) {
                    Log::warning("MeterReadingSeeder: billing failed for meter #{$meter->id}: {$exception->getMessage()}");
                }
            }
        }

        $this->command?->info("Seeded {$readingsCreated} meter reading(s) and {$billsCreated} bill(s).");
    }
}
