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

        foreach ($meterReadings as $reading) {
            $meter = $reading->meter;
            $home = $meter->home;
            $customer = $home->customer;

            if (!$customer) {
                continue;
            }

            $consumption = $reading->consumption ?? 0;
            $totalAmount = $consumption * $ratePerUnit;
            
            // Generate bill number
            $billNumber = 'BILL-' . str_pad($billCounter++, 8, '0', STR_PAD_LEFT);
            
            // Calculate billing period (assume monthly billing)
            $billingPeriodStart = $reading->reading_date->copy()->startOfMonth();
            $billingPeriodEnd = $reading->reading_date->copy()->endOfMonth();
            $dueDate = $reading->reading_date->copy()->addDays(30);

            // Randomly assign status
            $statuses = ['pending', 'paid', 'overdue'];
            $status = $statuses[array_rand($statuses)];

            Bill::create([
                'bill_number' => $billNumber,
                'meter_reading_id' => $reading->id,
                'customer_id' => $customer->id,
                'billing_period_start' => $billingPeriodStart,
                'billing_period_end' => $billingPeriodEnd,
                'total_amount' => $totalAmount,
                'due_date' => $dueDate,
                'status' => $status,
            ]);
        }
    }
}

