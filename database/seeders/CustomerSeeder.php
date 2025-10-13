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
        $meters = Meter::where('status', 'active')->get(); // Only use active meters

        if ($neighborhoods->isEmpty() || $categories->isEmpty() || $meters->isEmpty()) {
            $this->command->warn('Please run NeighborhoodSeeder, CategorySeeder, and MeterSeeder first.');
            return;
        }

        $this->command->info('Generating 10 customers with existing active meters...');

        // Sample customer data
        $firstNames = ['John', 'Jane', 'Robert', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Maria'];
        $lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Garcia'];
        $streets = ['Main Street', 'Oak Avenue', 'Pine Road', 'Elm Street', 'Maple Drive', 'Cedar Lane', 'Birch Court', 'Spruce Street', 'Willow Way', 'Poplar Place'];
        $plotPrefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        // Generate 10 customers
        for ($i = 1; $i <= 10; $i++) {
            $firstName = $firstNames[$i - 1];
            $lastName = $lastNames[$i - 1];
            $street = $streets[$i - 1];
            $plotPrefix = $plotPrefixes[$i - 1];
            
            // Random credit amount (0-200)
            $credit = fake()->randomFloat(2, 0, 200);
            
            // Random contract date (1-24 months ago)
            $contractDate = now()->subMonths(fake()->numberBetween(1, 24));
            
            // Random coordinates around Juba, South Sudan
            $latitude = fake()->latitude(4.8, 5.0);
            $longitude = fake()->longitude(31.5, 31.7);
            
            // Get random neighborhood and category
            $neighborhood = $neighborhoods->random();
            $category = $categories->random();
            
            // Get a random active meter that's not already assigned
            $availableMeters = $meters->whereNotIn('id', Customer::pluck('meter_id')->filter());
            $meter = $availableMeters->isNotEmpty() ? $availableMeters->random() : $meters->random();

            $customer = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'phone' => '+211' . fake()->numerify('########'),
                'plot_number' => $plotPrefix . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'address' => fake()->numberBetween(100, 999) . ' ' . $street,
                'credit' => $credit,
                'email' => strtolower($firstName . '.' . $lastName . '@email.com'),
                'contract' => 'CON-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'date' => $contractDate,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'neighborhood_id' => $neighborhood->id,
                'category_id' => $category->id,
                'meter_id' => $meter->id,
                'account_number' => 'ACC-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'is_active' => true,
            ];

            Customer::firstOrCreate(
                ['account_number' => $customer['account_number']],
                $customer
            );
        }

        $this->command->info('Successfully generated 10 customers with existing active meters!');
    }
}
