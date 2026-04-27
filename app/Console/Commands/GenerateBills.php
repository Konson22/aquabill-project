<?php

namespace App\Console\Commands;

use App\Models\Meter;
use App\Services\BillService;
use Illuminate\Console\Command;

class GenerateBills extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bills:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate bills for all meters with unbilled readings';

    /**
     * Execute the console command.
     */
    public function handle(BillService $billService): void
    {
        $meters = Meter::where('status', 'active')->get();
        $count = 0;
        $skipped = 0;

        $this->info('Starting bill generation for '.$meters->count().' active meters...');

        foreach ($meters as $meter) {
            try {
                $bill = $billService->generateForMeter($meter);
                if ($bill) {
                    $count++;
                    $this->line("Bill #{$bill->id} generated for Meter #{$meter->meter_number}");
                } else {
                    $skipped++;
                }
            } catch (\Exception $e) {
                $this->error("Failed for Meter #{$meter->meter_number}: ".$e->getMessage());
            }
        }

        $this->info('Generation completed!');
        $this->info("Bills created: {$count}");
        $this->info("Meters skipped (no new readings): {$skipped}");
    }
}
