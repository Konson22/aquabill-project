<?php

namespace Database\Factories;

use App\Models\ServiceCharge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceCharge>
 */
class ServiceChargeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = \App\Models\ServiceChargeType::inRandomOrder()->first();
        
        return [
            'customer_id' => \App\Models\Customer::factory(),
            'bill_id' => null,
            'service_charge_type_id' => $type->id,
            'amount' => $type->amount,
            'issued_by' => \App\Models\User::inRandomOrder()->first()?->id,
            'issued_date' => $this->faker->date(),
            'due_date' => $this->faker->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['unpaid', 'paid']),
            'notes' => $this->faker->sentence(),
        ];
    }
}
