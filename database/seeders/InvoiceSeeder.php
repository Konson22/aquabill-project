<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Home;
use App\Models\Invoice;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $homes = Home::with('customer')->get();

        if ($homes->isEmpty()) {
            $this->command->warn('No homes found. Please run HomeSeeder first.');
            return;
        }

        $invoiceTypes = [
            'repair_fee' => ['Repair Fee', 50, 200],
            'service_fee' => ['Service Fee', 25, 100],
            'installation_fee' => ['Installation Fee', 75, 300],
            'maintenance_fee' => ['Maintenance Fee', 30, 150],
            'connection_fee' => ['Connection Fee', 100, 500],
        ];

        $invoiceCounter = 1;

        // Create 2-4 invoices per home
        foreach ($homes as $home) {
            $numInvoices = rand(2, 4);

            for ($i = 0; $i < $numInvoices; $i++) {
                $type = array_rand($invoiceTypes);
                [$description, $minAmount, $maxAmount] = $invoiceTypes[$type];
                
                $amount = rand($minAmount, $maxAmount);
                $invoiceDate = now()->subMonths(rand(1, 6))->addDays(rand(1, 20));
                $dueDate = $invoiceDate->copy()->addDays(30);

                // Randomly assign status
                $statuses = ['pending', 'paid', 'overdue'];
                $status = $statuses[array_rand($statuses)];

                Invoice::create([
                    'invoice_number' => 'INV-' . str_pad($invoiceCounter++, 8, '0', STR_PAD_LEFT),
                    'customer_id' => $home->customer_id,
                    'home_id' => $home->id,
                    'type' => $type,
                    'description' => $description . ' - ' . $home->address,
                    'amount' => $amount,
                    'due_date' => $dueDate,
                    'status' => $status,
                ]);
            }
        }
    }
}

