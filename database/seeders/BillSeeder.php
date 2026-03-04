<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Customer;
use App\Models\MeterReading;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meterReadings = MeterReading::where('status', 'billed')
            ->with('meter.home.customer')
            ->get();

        if ($meterReadings->isEmpty()) {
            $this->command->warn('No billed meter readings found. Please run MeterReadingSeeder first.');
            return;
        }

        $billCounter = 1;
        $ratePerUnit = 2.50; // Example rate per unit of consumption
        $fixedCharge = 15.00;

        foreach ($meterReadings as $reading) {
            $meter = $reading->meter;
            $home = $meter->home;
            $customer = $home->customer;

            if (!$customer) {
                continue;
            }

            $consumption = (float) ($reading->consumption ?? 0);
            $previousBalance = 0;

            $billNumber = 'BILL-' . str_pad($billCounter++, 8, '0', STR_PAD_LEFT);
            $billingPeriodStart = $reading->reading_date->copy()->startOfMonth();
            $billingPeriodEnd = $reading->reading_date->copy()->endOfMonth();
            $dueDate = $reading->reading_date->copy()->addDays(30);

            Bill::create([
                'bill_number' => $billNumber,
                'meter_reading_id' => $reading->id,
                'customer_id' => $customer->id,
                'billing_period_start' => $billingPeriodStart,
                'billing_period_end' => $billingPeriodEnd,
                'tariff' => $ratePerUnit,
                'fix_charges' => $fixedCharge,
                'water_consumption_volume' => $consumption,
                'previous_balance' => $previousBalance,
                'due_date' => $dueDate,
            ]);
        }
    }
}
