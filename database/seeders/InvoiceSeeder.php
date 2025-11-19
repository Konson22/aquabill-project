<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Invoice;
use App\Models\Customer;

class InvoiceSeeder extends Seeder
{
    /**
     * Cache generated numbers to avoid duplicates during a single run.
     */
    private array $generatedNumbers = [];

    public function run(): void
    {
        // Get customers for relationships
        $customers = Customer::all();

        if ($customers->isEmpty()) {
            $this->command->warn('Please run CustomerSeeder first.');
            return;
        }

        $invoices = [];
        $currentDate = now();

        // Generate invoices for customers
        foreach ($customers as $customer) {
            // Generate 1-3 invoices per customer
            $invoiceCount = rand(1, 3);
            
            for ($i = 0; $i < $invoiceCount; $i++) {
                $issueDate = $currentDate->copy()->subDays(rand(1, 90));
                $dueDate = $issueDate->copy()->addDays(rand(15, 30));
                
                $invoices[] = [
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'customer_id' => $customer->id,
                    'reason' => $this->getRandomReason(),
                    'issue_date' => $issueDate->format('Y-m-d'),
                    'due_date' => $dueDate->format('Y-m-d'),
                    'amount_due' => $this->getRandomAmount(),
                    'status' => $this->getRandomInvoiceStatus(),
                    'created_at' => $issueDate,
                    'updated_at' => $issueDate,
                ];
            }
        }

        // Insert invoices in batches
        foreach (array_chunk($invoices, 100) as $chunk) {
            Invoice::insert($chunk);
        }
    }

    private function getRandomReason(): string
    {
        $reasons = [
            'Service Connection Fee',
            'Meter Installation Fee',
            'Late Payment Penalty',
            'Service Restoration Fee',
            'Meter Reading Fee',
            'Account Setup Fee',
            'Deposit Refund',
            'Credit Adjustment',
            'Service Upgrade Fee',
            'Maintenance Fee',
            'Emergency Service Fee',
            'Account Transfer Fee',
            'Meter Replacement Fee',
            'Water Quality Test Fee',
            'Special Reading Fee',
        ];

        return $reasons[array_rand($reasons)];
    }

    private function getRandomAmount(): float
    {
        // Generate amounts between $10 and $500
        return round(rand(1000, 50000) / 100, 2);
    }

    private function getRandomInvoiceStatus(): string
    {
        $statuses = ['pending', 'paid', 'cancelled'];
        $weights = [40, 50, 10]; // 40% pending, 50% paid, 10% cancelled

        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($statuses as $index => $status) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $status;
            }
        }
        
        return 'pending'; // Fallback
    }

    private function generateInvoiceNumber(): string
    {
        do {
            $number = 'INV-' . strtoupper(Str::random(10));
        } while (in_array($number, $this->generatedNumbers, true) || Invoice::where('invoice_number', $number)->exists());

        $this->generatedNumbers[] = $number;

        return $number;
    }
}
