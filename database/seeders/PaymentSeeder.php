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
        $bills = Bill::where('status', 'fully paid')->get();
        $invoices = Invoice::where('status', 'paid')->get();

        if ($bills->isEmpty() && $invoices->isEmpty()) {
            $this->command->warn('No paid bills or invoices found. Please run BillSeeder and InvoiceSeeder first.');
            return;
        }

        $paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_money', 'check'];

        // Create payments for fully paid bills
        foreach ($bills as $bill) {
            $this->createPayment($bill, $bill->total_amount, $paymentMethods);
        }

        // Create payments for paid invoices
        foreach ($invoices as $invoice) {
            $this->createPayment($invoice, $invoice->amount, $paymentMethods);
        }

        // Create partial payments for some pending bills and invoices
        $pendingBills = Bill::whereIn('status', ['pending', 'partial paid'])->limit(5)->get();
        foreach ($pendingBills as $bill) {
            $partialAmount = $bill->total_amount * (rand(30, 70) / 100);
            $this->createPayment($bill, $partialAmount, $paymentMethods);
        }

        $pendingInvoices = Invoice::where('status', 'pending')->limit(5)->get();
        foreach ($pendingInvoices as $invoice) {
            $partialAmount = $invoice->amount * (rand(30, 70) / 100);
            $this->createPayment($invoice, $partialAmount, $paymentMethods);
        }
    }

    /**
     * Create a payment for a bill or invoice
     */
    private function createPayment($payable, float $amount, array $paymentMethods): void
    {
        $paymentDate = $payable->due_date->copy()->subDays(rand(0, 30));
        
        $amountPaidBefore = (float) $payable->amount_paid;
        $newAmountPaid = $amountPaidBefore + $amount;
        
        $payableTotal = $payable instanceof Bill
            ? (float) $payable->total_amount
            : (float) $payable->amount;
        
        if ($payable instanceof Bill) {
            $balanceAfter = (float) $payable->total_amount - $newAmountPaid;
        } else {
            $balanceAfter = (float) $payable->amount - $newAmountPaid;
        }
        
        Payment::create([
            'payable_type' => get_class($payable),
            'payable_id' => $payable->id,
            'amount' => $amount,
            'payable_total' => $payableTotal,
            'amount_paid' => $newAmountPaid,
            'balance_after' => $balanceAfter,
            'payment_date' => $paymentDate,
            'payment_method' => $paymentMethods[array_rand($paymentMethods)],
            'reference_number' => 'REF-' . strtoupper(substr(md5(rand()), 0, 8)),
            'received_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'notes' => rand(0, 1) ? 'Payment processed successfully' : null,
        ]);
    }
}

