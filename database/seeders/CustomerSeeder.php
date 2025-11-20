<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Neighborhood;
use App\Models\Category;
use App\Models\Meter;
use Carbon\Carbon;

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
            
            // Random credit amount (0-200) - decimal(10,2)
            $credit = round(fake()->randomFloat(2, 0, 200), 2);
            
            // Random contract date (1-24 months ago) - date field
            $contractDate = Carbon::now()->subMonths(fake()->numberBetween(1, 24))->format('Y-m-d');
            
            // Random coordinates around Juba, South Sudan
            // latitude: decimal(10,8), longitude: decimal(11,8)
            $latitude = round(fake()->latitude(4.8, 5.0), 8);
            $longitude = round(fake()->longitude(31.5, 31.7), 8);
            
            // Get random neighborhood and category
            $neighborhood = $neighborhoods->random();
            $category = $categories->random();
            
            // Get a random active meter that's not already assigned
            $availableMeters = $meters->whereNotIn('id', Customer::pluck('meter_id')->filter());
            $meter = $availableMeters->isNotEmpty() ? $availableMeters->random() : $meters->random();

            $customer = [
                'first_name' => $firstName, // string(255), nullable
                'last_name' => $lastName, // string(255), nullable
                'phone' => '+211' . fake()->numerify('########'), // string(20), nullable
                'plot_number' => $plotPrefix . '-' . str_pad($i, 3, '0', STR_PAD_LEFT), // string(20), nullable
                'address' => fake()->numberBetween(100, 999) . ' ' . $street, // string(255), nullable
                'credit' => $credit, // decimal(10,2), nullable
                'email' => strtolower($firstName . '.' . $lastName . '@email.com'), // string(255), nullable
                'contract' => 'CON-' . str_pad($i, 3, '0', STR_PAD_LEFT), // string(50), nullable
                'date' => $contractDate, // date, nullable
                'latitude' => $latitude, // decimal(10,8), nullable
                'longitude' => $longitude, // decimal(11,8), nullable
                'neighborhood_id' => $neighborhood->id, // foreignId, nullable
                'category_id' => $category->id, // foreignId, nullable
                'meter_id' => $meter->id, // foreignId, nullable
                'account_number' => 'ACC-' . str_pad($i, 3, '0', STR_PAD_LEFT), // string, nullable, unique
                'is_active' => true, // boolean, default true
            ];

            Customer::firstOrCreate(
                ['account_number' => $customer['account_number']],
                $customer
            );
        }

        $this->command->info('Successfully generated 10 customers with existing active meters!');
    }
}
