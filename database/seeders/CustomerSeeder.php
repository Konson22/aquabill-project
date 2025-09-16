<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        // Get available IDs for relationships
        $neighborhoodIds = Neighborhood::query()->pluck('id')->all();
        $categoryIds = Category::query()->pluck('id')->all();

        // Get available meters (prefer unassigned ones)
        $availableMeterIds = Meter::doesntHave('customer')->pluck('id')->all();
        if (empty($availableMeterIds)) {
            $availableMeterIds = Meter::query()->pluck('id')->all();
        }

        $numCustomers = 120;
        $createdCount = 0;
        $errors = [];

        $this->command->info("Creating {$numCustomers} customers...");

        for ($i = 0; $i < $numCustomers; $i++) {
            try {
                $firstName = $faker->firstName();
                $lastName = $faker->lastName();

                // Assign a meter if available (70% chance)
                $meterId = null;
                if (!empty($availableMeterIds) && $faker->boolean(70)) {
                    $meterId = array_shift($availableMeterIds);
                }

                // Generate unique account number
                $accountNumber = 'ACC' . str_pad($i + 1, 5, '0', STR_PAD_LEFT);

                $customer = Customer::create([
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $faker->phoneNumber(),
                    'email' => $faker->unique()->safeEmail(),
                    'plot_number' => $faker->buildingNumber(),
                    'address' => $faker->streetAddress(),
                    'credit' => $faker->randomFloat(2, 0, 1000),
                    'contract' => 'CONTRACT-' . strtoupper(Str::random(8)),
                    'date' => $faker->dateTimeBetween('-2 years', 'now'),
                    'latitude' => $faker->latitude(-1.5, -1.0), // Kenya coordinates
                    'longitude' => $faker->longitude(36.5, 37.0), // Kenya coordinates
                    'neighborhood_id' => $faker->randomElement($neighborhoodIds),
                    'category_id' => $faker->randomElement($categoryIds),
                    'meter_id' => $meterId,
                    'account_number' => $accountNumber,
                    'is_active' => $faker->boolean(85), // 85% active customers
                ]);

                $createdCount++;

                if ($createdCount % 20 == 0) {
                    $this->command->info("Created {$createdCount} customers...");
                }

            } catch (\Exception $e) {
                $this->command->error("Error creating customer {$i}: " . $e->getMessage());
            }
        }

        $this->command->info("Customer seeding completed!");
        $this->command->info("Successfully created: {$createdCount} customers");
        
        if (!empty($errors)) {
            $this->command->warn("Errors encountered: " . count($errors));
            foreach ($errors as $error) {
                $this->command->error($error);
            }
        }
    }
}
