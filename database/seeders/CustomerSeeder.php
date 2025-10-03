<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Neighborhood;
use App\Models\Category;
use App\Models\Meter;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        // Get some neighborhoods, categories, and meters for relationships
        $neighborhoods = Neighborhood::all();
        $categories = Category::all();
        $meters = Meter::all();

        if ($neighborhoods->isEmpty() || $categories->isEmpty() || $meters->isEmpty()) {
            $this->command->warn('Please run NeighborhoodSeeder, CategorySeeder, and MeterSeeder first.');
            return;
        }

        $customers = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'phone' => '+1234567890',
                'plot_number' => 'A-001',
                'address' => '123 Main Street',
                'credit' => 0.00,
                'email' => 'john.doe@email.com',
                'contract' => 'CON-001',
                'date' => now()->subMonths(12),
                'latitude' => 40.7128,
                'longitude' => -74.0060,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-001',
                'is_active' => true,
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'phone' => '+1234567891',
                'plot_number' => 'B-002',
                'address' => '456 Oak Avenue',
                'credit' => 50.00,
                'email' => 'jane.smith@email.com',
                'contract' => 'CON-002',
                'date' => now()->subMonths(8),
                'latitude' => 40.7589,
                'longitude' => -73.9851,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-002',
                'is_active' => true,
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Johnson',
                'phone' => '+1234567892',
                'plot_number' => 'C-003',
                'address' => '789 Pine Road',
                'credit' => 0.00,
                'email' => 'robert.johnson@email.com',
                'contract' => 'CON-003',
                'date' => now()->subMonths(6),
                'latitude' => 40.6892,
                'longitude' => -74.0445,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'RES_LOW')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-003',
                'is_active' => true,
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'phone' => '+1234567893',
                'plot_number' => 'D-004',
                'address' => '321 Elm Street',
                'credit' => 25.00,
                'email' => 'sarah.williams@email.com',
                'contract' => 'CON-004',
                'date' => now()->subMonths(10),
                'latitude' => 40.7505,
                'longitude' => -73.9934,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'COM_SMALL')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-004',
                'is_active' => true,
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Brown',
                'phone' => '+1234567894',
                'plot_number' => 'E-005',
                'address' => '654 Maple Drive',
                'credit' => 0.00,
                'email' => 'michael.brown@email.com',
                'contract' => 'CON-005',
                'date' => now()->subMonths(4),
                'latitude' => 40.7282,
                'longitude' => -73.7949,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'RES_STD')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-005',
                'is_active' => true,
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Davis',
                'phone' => '+1234567895',
                'plot_number' => 'F-006',
                'address' => '987 Cedar Lane',
                'credit' => 100.00,
                'email' => 'emily.davis@email.com',
                'contract' => 'CON-006',
                'date' => now()->subMonths(15),
                'latitude' => 40.7614,
                'longitude' => -73.9776,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'COM_MED')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-006',
                'is_active' => true,
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Wilson',
                'phone' => '+1234567896',
                'plot_number' => 'G-007',
                'address' => '147 Birch Court',
                'credit' => 0.00,
                'email' => 'david.wilson@email.com',
                'contract' => 'CON-007',
                'date' => now()->subMonths(3),
                'latitude' => 40.6892,
                'longitude' => -74.0445,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'IND_LIGHT')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-007',
                'is_active' => true,
            ],
            [
                'first_name' => 'Lisa',
                'last_name' => 'Anderson',
                'phone' => '+1234567897',
                'plot_number' => 'H-008',
                'address' => '258 Spruce Street',
                'credit' => 75.00,
                'email' => 'lisa.anderson@email.com',
                'contract' => 'CON-008',
                'date' => now()->subMonths(18),
                'latitude' => 40.7505,
                'longitude' => -73.9934,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'RES_HIGH')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-008',
                'is_active' => true,
            ],
            [
                'first_name' => 'James',
                'last_name' => 'Taylor',
                'phone' => '+1234567898',
                'plot_number' => 'I-009',
                'address' => '369 Willow Way',
                'credit' => 0.00,
                'email' => 'james.taylor@email.com',
                'contract' => 'CON-009',
                'date' => now()->subMonths(7),
                'latitude' => 40.7282,
                'longitude' => -73.7949,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'GOV')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-009',
                'is_active' => true,
            ],
            [
                'first_name' => 'Maria',
                'last_name' => 'Garcia',
                'phone' => '+1234567899',
                'plot_number' => 'J-010',
                'address' => '741 Poplar Place',
                'credit' => 150.00,
                'email' => 'maria.garcia@email.com',
                'contract' => 'CON-010',
                'date' => now()->subMonths(20),
                'latitude' => 40.7614,
                'longitude' => -73.9776,
                'neighborhood_id' => $neighborhoods->random()->id,
                'category_id' => $categories->where('type_id', 'EDU')->first()->id,
                'meter_id' => $meters->random()->id,
                'account_number' => 'ACC-010',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(
                ['account_number' => $customer['account_number']],
                $customer
            );
        }
    }
}
