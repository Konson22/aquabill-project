<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Branch;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $account = Account::first();
        $branch = Branch::first();
        if (! $account || ! $branch) {
            return;
        }

        // Categories
        $localFood = MenuCategory::updateOrCreate(['name' => 'Local Foods', 'account_id' => $account->id], ['type' => 'food']);
        $drinks = MenuCategory::updateOrCreate(['name' => 'Soft Drinks', 'account_id' => $account->id], ['type' => 'drink']);

        // Items
        MenuItem::updateOrCreate(
            ['name' => 'Asida & Bamia', 'account_id' => $account->id, 'branch_id' => $branch->id],
            [
                'menu_category_id' => $localFood->id,
                'description' => 'Classic traditional dish',
                'price' => 1500,
                'currency' => 'SSP',
                'available' => true,
            ]
        );

        MenuItem::updateOrCreate(
            ['name' => 'Coca Cola 500ml', 'account_id' => $account->id, 'branch_id' => $branch->id],
            [
                'menu_category_id' => $drinks->id,
                'description' => 'Refreshing soft drink',
                'price' => 500,
                'currency' => 'SSP',
                'available' => true,
            ]
        );
    }
}
