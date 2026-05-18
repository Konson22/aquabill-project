<?php

namespace Database\Factories;

use App\Models\ConnectionRequest;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConnectionRequest>
 */
class ConnectionRequestFactory extends Factory
{
    protected $model = ConnectionRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tariff = Tariff::query()->inRandomOrder()->first() ?? Tariff::factory()->create();
        $zone = Zone::query()->inRandomOrder()->first();

        if (! $zone) {
            $zone = Zone::factory()->create();
        }

        return [
            'name' => fake()->name(),
            'phone' => fake()->numerify('09########'),
            'email' => fake()->optional()->safeEmail(),
            'national_id' => fake()->optional()->numerify('##########'),
            'address' => fake()->streetAddress(),
            'plot_no' => fake()->optional()->bothify('Plot-###'),
            'customer_type' => fake()->randomElement(['residential', 'commercial', 'government']),
            'zone_id' => $zone->id,
            'tariff_id' => $tariff->id,
            'status' => 'pending',
            'total_amount' => 0,
            'issued_date' => now()->toDateString(),
            'issued_by' => User::factory(),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (): array => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'status' => 'completed',
            'paid_at' => now()->subDay(),
            'completed_at' => now(),
        ]);
    }
}
