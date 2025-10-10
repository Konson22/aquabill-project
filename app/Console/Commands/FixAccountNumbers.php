<?php

namespace App\Console\Commands;

use App\Models\Customer;
use Illuminate\Console\Command;

class FixAccountNumbers extends Command
{
    protected $signature = 'fix:account-numbers';
    protected $description = 'Fix duplicate account numbers in the customers table';

    public function handle()
    {
        $this->info('Checking for duplicate account numbers...');
        
        // Find customers with duplicate account numbers
        $duplicates = Customer::select('account_number')
            ->groupBy('account_number')
            ->havingRaw('COUNT(*) > 1')
            ->get();
            
        if ($duplicates->isEmpty()) {
            $this->info('No duplicate account numbers found.');
            return;
        }
        
        $this->warn('Found ' . $duplicates->count() . ' duplicate account numbers:');
        
        foreach ($duplicates as $duplicate) {
            $this->line('- ' . $duplicate->account_number);
            
            // Get all customers with this account number
            $customers = Customer::where('account_number', $duplicate->account_number)
                ->orderBy('id')
                ->get();
                
            // Keep the first one, fix the rest
            $firstCustomer = $customers->first();
            $this->info("  Keeping customer ID {$firstCustomer->id} with account number {$duplicate->account_number}");
            
            // Fix the rest
            for ($i = 1; $i < $customers->count(); $i++) {
                $customer = $customers[$i];
                $newAccountNumber = $this->generateUniqueAccountNumber($customer->id);
                
                $customer->update(['account_number' => $newAccountNumber]);
                $this->info("  Fixed customer ID {$customer->id} -> {$newAccountNumber}");
            }
        }
        
        $this->info('Account number fixes completed!');
    }
    
    private function generateUniqueAccountNumber($customerId)
    {
        // Simply use the customer ID as the account number
        return 'ACC' . str_pad($customerId, 5, '0', STR_PAD_LEFT);
    }
}
