<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        Account::updateOrCreate(
            ['domain' => 'main.test'],
            [
                'name' => 'MilesPOS Global',
                'plan' => 'enterprise',
                'business_type' => 'Restaurant & Hotel',
                'phone' => '+211900000000',
                'email' => 'contact@milespos.test',
            ]
        );
    }
}
