<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Bill;
use App\Models\Invoice;
use App\Models\User;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Get customers, bills, invoices, and users for relationships
        $customers = Customer::all();
        $bills = Bill::all();
        $invoices = Invoice::all();
        $users = User::all();

        if ($customers->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Please run CustomerSeeder and UserSeeder first.');
            return;
        }

        $payments = [];
        $currentDate = now();

        // Generate payments for bills
        foreach ($bills as $bill) {
            // Only generate payments for paid or partially paid bills
            if (in_array($bill->status, ['paid', 'partially_paid'])) {
                $paymentDate = $bill->billing_period_end->copy()->addDays(rand(1, 30));
                
                // For partially paid bills, generate partial payment
                if ($bill->status === 'partially_paid') {
                    $amountPaid = $bill->total_amount * (rand(30, 80) / 100); // 30-80% of total
                } else {
                    $amountPaid = $bill->total_amount;
                }

                $payments[] = [
                    'customer_id' => $bill->customer_id,
                    'bill_id' => $bill->id,
                    'invoice_id' => null,
                    'payment_date' => $paymentDate->format('Y-m-d'),
                    'amount_paid' => $amountPaid,
                    'payment_method' => $this->getRandomPaymentMethod(),
                    'reference_number' => $this->generateReferenceNumber(),
                    'received_by' => $users->random()->id,
                    'created_at' => $paymentDate,
                    'updated_at' => $paymentDate,
                ];
            }
        }

        // Generate payments for invoices
        foreach ($invoices as $invoice) {
            // Only generate payments for paid invoices
            if ($invoice->status === 'paid') {
                $paymentDate = $invoice->issue_date->copy()->addDays(rand(1, 15));
                
                $payments[] = [
                    'customer_id' => $invoice->customer_id,
                    'bill_id' => null,
                    'invoice_id' => $invoice->id,
                    'payment_date' => $paymentDate->format('Y-m-d'),
                    'amount_paid' => $invoice->amount_due,
                    'payment_method' => $this->getRandomPaymentMethod(),
                    'reference_number' => $this->generateReferenceNumber(),
                    'received_by' => $users->random()->id,
                    'created_at' => $paymentDate,
                    'updated_at' => $paymentDate,
                ];
            }
        }

        // Generate some additional payments for unpaid bills (to make them partially paid)
        foreach ($bills as $bill) {
            if ($bill->status === 'unpaid' && rand(1, 3) === 1) { // 1 in 3 chance
                $paymentDate = $bill->billing_period_end->copy()->addDays(rand(1, 15));
                $amountPaid = $bill->total_amount * (rand(20, 60) / 100); // 20-60% of total
                
                $payments[] = [
                    'customer_id' => $bill->customer_id,
                    'bill_id' => $bill->id,
                    'invoice_id' => null,
                    'payment_date' => $paymentDate->format('Y-m-d'),
                    'amount_paid' => $amountPaid,
                    'payment_method' => $this->getRandomPaymentMethod(),
                    'reference_number' => $this->generateReferenceNumber(),
                    'received_by' => $users->random()->id,
                    'created_at' => $paymentDate,
                    'updated_at' => $paymentDate,
                ];
            }
        }

        // Generate some additional payments for pending invoices
        foreach ($invoices as $invoice) {
            if ($invoice->status === 'pending' && rand(1, 2) === 1) { // 1 in 2 chance
                $paymentDate = $invoice->issue_date->copy()->addDays(rand(1, 10));
                
                $payments[] = [
                    'customer_id' => $invoice->customer_id,
                    'bill_id' => null,
                    'invoice_id' => $invoice->id,
                    'payment_date' => $paymentDate->format('Y-m-d'),
                    'amount_paid' => $invoice->amount_due,
                    'payment_method' => $this->getRandomPaymentMethod(),
                    'reference_number' => $this->generateReferenceNumber(),
                    'received_by' => $users->random()->id,
                    'created_at' => $paymentDate,
                    'updated_at' => $paymentDate,
                ];
            }
        }

        // Insert payments in batches
        foreach (array_chunk($payments, 100) as $chunk) {
            Payment::insert($chunk);
        }
    }

    private function getRandomPaymentMethod(): string
    {
        $methods = ['cash', 'mobile_money', 'bank_transfer'];
        $weights = [40, 35, 25]; // 40% cash, 35% mobile money, 25% bank transfer

        $totalWeight = array_sum($weights);
        $random = mt_rand(1, $totalWeight);
        
        $currentWeight = 0;
        foreach ($methods as $index => $method) {
            $currentWeight += $weights[$index];
            if ($random <= $currentWeight) {
                return $method;
            }
        }
        
        return 'cash'; // Fallback
    }

    private function generateReferenceNumber(): string
    {
        $prefixes = ['PAY', 'TXN', 'REF', 'PMT'];
        $prefix = $prefixes[array_rand($prefixes)];
        $number = str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        return $prefix . '-' . $number;
    }

}
