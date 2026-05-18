<?php

use App\Models\Customer;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Laravel\Sanctum\Sanctum;

test('guests cannot batch update customer coordinates', function (): void {
    $this->postJson('/api/customers/coordinates', [])->assertUnauthorized();
});

test('authenticated user can batch update customer coordinates', function (): void {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'API COORD TARIFF',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);
    $zone = Zone::factory()->create();
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Coord Customer',
        'phone' => '123456789',
        'address' => '1 API St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
        'latitude' => null,
        'longitude' => null,
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/customers/coordinates', [
        [
            'record_id' => 'sync-row-1',
            'customer_id' => $customer->id,
            'latitude' => 4.85941,
            'longitude' => 31.57125,
        ],
    ])
        ->assertOk()
        ->assertJson(['updated_record_ids' => ['sync-row-1']]);

    $customer->refresh();

    expect((float) $customer->latitude)->toBe(4.85941)
        ->and((float) $customer->longitude)->toBe(31.57125);
});

test('batch coordinate update returns validation error for invalid row', function (): void {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/customers/coordinates', [
        [
            'record_id' => 'x',
            'customer_id' => 999999,
            'latitude' => 200,
            'longitude' => 31,
        ],
    ])->assertUnprocessable();
});
