<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'John Doe',
                'phone' => '+1234567890',
                'email' => 'john.doe@example.com',
            ],
            [
                'name' => 'Jane Smith',
                'phone' => '+1234567891',
                'email' => 'jane.smith@example.com',
            ],
            [
                'name' => 'Robert Johnson',
                'phone' => '+1234567892',
                'email' => 'robert.johnson@example.com',
            ],
            [
                'name' => 'Maria Garcia',
                'phone' => '+1234567893',
                'email' => 'maria.garcia@example.com',
            ],
            [
                'name' => 'Ahmed Hassan',
                'phone' => '+1234567894',
                'email' => 'ahmed.hassan@example.com',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
