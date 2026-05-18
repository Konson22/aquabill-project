<?php

namespace Database\Factories;

use App\Models\ConnectionRequest;
use App\Models\ConnectionRequestItem;
use App\Models\ServiceChargeType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConnectionRequestItem>
 */
class ConnectionRequestItemFactory extends Factory
{
    protected $model = ConnectionRequestItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = ServiceChargeType::query()->inRandomOrder()->first();

        return [
            'connection_request_id' => ConnectionRequest::factory(),
            'service_charge_type_id' => $type?->id,
            'description' => $type?->name ?? fake()->words(3, true),
            'amount' => $type?->amount ?? fake()->randomFloat(2, 10, 100),
            'quantity' => 1,
            'sort_order' => 0,
        ];
    }
}
