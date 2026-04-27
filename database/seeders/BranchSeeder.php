<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $account = Account::first();

        if (! $account) {
            return;
        }

        Branch::updateOrCreate(
            ['name' => 'Juba Main Headquarters'],
            [
                'account_id' => $account->id,
                'location' => 'Airport Road, Juba',
                'phone' => '+211910000001',
                'is_main' => true,
                'status' => 'active',
            ]
        );

        Branch::updateOrCreate(
            ['name' => 'Juba Town Branch'],
            [
                'account_id' => $account->id,
                'location' => 'Custom Market Area, Juba',
                'phone' => '+211910000002',
                'is_main' => false,
                'status' => 'active',
            ]
        );
    }
}
