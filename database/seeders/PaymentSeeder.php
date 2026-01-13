<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bills = Bill::where('status', 'paid')->get();
        $invoices = Invoice::where('status', 'paid')->get();

        if ($bills->isEmpty() && $invoices->isEmpty()) {
            $this->command->warn('No paid bills or invoices found. Please run BillSeeder and InvoiceSeeder first.');
            return;
        }

        $paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_money', 'check'];
        $paymentCounter = 1;

        // Create payments for paid bills
        foreach ($bills as $bill) {
            $this->createPayment($bill, $bill->total_amount, $paymentMethods, $paymentCounter);
            $paymentCounter++;
        }

        // Create payments for paid invoices
        foreach ($invoices as $invoice) {
            $this->createPayment($invoice, $invoice->amount, $paymentMethods, $paymentCounter);
            $paymentCounter++;
        }

        // Create partial payments for some pending/overdue bills and invoices
        $pendingBills = Bill::whereIn('status', ['pending', 'overdue'])->limit(5)->get();
        foreach ($pendingBills as $bill) {
            $partialAmount = $bill->total_amount * (rand(30, 70) / 100);
            $this->createPayment($bill, $partialAmount, $paymentMethods, $paymentCounter);
            $paymentCounter++;
        }

        $pendingInvoices = Invoice::whereIn('status', ['pending', 'overdue'])->limit(5)->get();
        foreach ($pendingInvoices as $invoice) {
            $partialAmount = $invoice->amount * (rand(30, 70) / 100);
            $this->createPayment($invoice, $partialAmount, $paymentMethods, $paymentCounter);
            $paymentCounter++;
        }
    }

    /**
     * Create a payment for a bill or invoice
     */
    private function createPayment($payable, float $amount, array $paymentMethods, int $counter): void
    {
        $paymentDate = $payable->due_date->copy()->subDays(rand(0, 30));
        
        Payment::create([
            'payment_number' => 'PAY-' . str_pad($counter, 8, '0', STR_PAD_LEFT),
            'payable_type' => get_class($payable),
            'payable_id' => $payable->id,
            'amount' => $amount,
            'payment_date' => $paymentDate,
            'payment_method' => $paymentMethods[array_rand($paymentMethods)],
            'reference_number' => 'REF-' . strtoupper(substr(md5(rand()), 0, 8)),
            'notes' => rand(0, 1) ? 'Payment processed successfully' : null,
        ]);
    }
}

