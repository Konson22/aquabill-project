<?php

use App\Models\Customer;
use App\Models\ServiceChargeType;
use App\Models\User;

test('can create service charge for customer', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $chargeType = ServiceChargeType::factory()->create();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        [
            'service_charge_type_id' => $chargeType->id,
            'amount' => 100.00,
            'issued_date' => now()->toDateString(),
            'notes' => 'Test charge',
        ]
    );

    $response->assertStatus(201);
    $response->assertJsonPath('charge.customer_id', $customer->id);
    $response->assertJsonPath('charge.service_charge_type_id', $chargeType->id);
    $response->assertJsonPath('charge.amount', '100.00');
    $response->assertJsonPath('charge.status', 'unpaid');
    $response->assertJsonPath('charge.issued_by', $user->id);

    $this->assertDatabaseHas('service_charges', [
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => '100.00',
        'status' => 'unpaid',
    ]);
});

test('validates required fields when creating service charge', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        []
    );

    $response->assertStatus(422);
    $response->assertJsonValidationErrors([
        'service_charge_type_id',
        'amount',
        'issued_date',
    ]);
});

test('validates amount is positive when creating service charge', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $chargeType = ServiceChargeType::factory()->create();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        [
            'service_charge_type_id' => $chargeType->id,
            'amount' => -50.00,
            'issued_date' => now()->toDateString(),
        ]
    );

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['amount']);
});

test('validates service charge type exists', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        [
            'service_charge_type_id' => 99999,
            'amount' => 100.00,
            'issued_date' => now()->toDateString(),
        ]
    );

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['service_charge_type_id']);
});
