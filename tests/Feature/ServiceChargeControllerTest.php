<?php

use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

/**
 * @return array{0: Zone, 1: Tariff}
 */
function createZoneAndTariffForServiceChargeTest(): array
{
    $tariff = Tariff::query()->create([
        'name' => 'T-'.uniqid(),
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Z-'.uniqid(),
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    return [$zone, $tariff];
}

function createCustomerForServiceChargeTest(): Customer
{
    [$zone, $tariff] = createZoneAndTariffForServiceChargeTest();

    return Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Test Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
}

function createServiceChargeTypeForTest(): ServiceChargeType
{
    $u = uniqid();

    return ServiceChargeType::query()->create([
        'name' => "Charge type {$u}",
        'code' => "C{$u}",
        'amount' => 10.00,
    ]);
}

test('guest is redirected from create service charge page', function () {
    $customer = createCustomerForServiceChargeTest();

    $this->get(route('customers.service-charges.create', $customer))
        ->assertRedirect();
});

test('authenticated user can view create service charge page', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    createServiceChargeTypeForTest();

    $this->actingAs($user)
        ->get(route('customers.service-charges.create', $customer))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('customers/service-charges/create')
            ->has('customer')
            ->has('serviceChargeTypes'));
});

test('can create service charge for customer', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        [
            'service_charge_type_id' => $chargeType->id,
            'issued_date' => now()->toDateString(),
            'notes' => 'Test charge',
        ]
    );

    $response->assertStatus(201);
    $response->assertJsonPath('charge.customer_id', $customer->id);
    $response->assertJsonPath('charge.service_charge_type_id', $chargeType->id);
    $response->assertJsonPath('charge.amount', '10.00');
    $response->assertJsonPath('charge.status', 'unpaid');
    $response->assertJsonPath('charge.issued_by', $user->id);

    $this->assertDatabaseHas('service_charges', [
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => '10.00',
        'status' => 'unpaid',
    ]);
});

test('validates required fields when creating service charge', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();

    $response = $this->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post(
            route('customers.service-charges.store', ['customer' => $customer->id]),
            []
        );

    $response->assertStatus(422);
    $response->assertJsonValidationErrors([
        'service_charge_type_id',
        'issued_date',
    ]);
});

test('can create service charge with other charges added to type amount', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $response = $this->actingAs($user)->post(
        route('customers.service-charges.store', ['customer' => $customer->id]),
        [
            'service_charge_type_id' => $chargeType->id,
            'other_charges' => 25.5,
            'issued_date' => now()->toDateString(),
        ],
    );

    $response->assertStatus(201);
    $response->assertJsonPath('charge.amount', '10.00');
    $response->assertJsonPath('charge.other_charges', '25.50');
    $response->assertJsonPath('charge.total_due', '35.50');

    $this->assertDatabaseHas('service_charges', [
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => '10.00',
        'other_charges' => '25.50',
    ]);
});

test('rejects service charge type with zero amount when creating service charge', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = ServiceChargeType::query()->create([
        'name' => 'Zero charge',
        'code' => 'ZERO'.uniqid(),
        'amount' => 0,
    ]);

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->post(
            route('customers.service-charges.store', ['customer' => $customer->id]),
            [
                'service_charge_type_id' => $chargeType->id,
                'issued_date' => now()->toDateString(),
            ],
        );

    $response->assertSessionHasErrors('service_charge_type_id');
    $this->assertDatabaseCount('service_charges', 0);
});

test('validates service charge type exists', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();

    $response = $this->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post(
            route('customers.service-charges.store', ['customer' => $customer->id]),
            [
                'service_charge_type_id' => 99999,
                'issued_date' => now()->toDateString(),
            ]
        );

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['service_charge_type_id']);
});

test('creating service charge via inertia redirects to service charges index', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $response = $this->actingAs($user)
        ->withHeader('X-Inertia', 'true')
        ->post(
            route('customers.service-charges.store', ['customer' => $customer->id]),
            [
                'service_charge_type_id' => $chargeType->id,
                'issued_date' => now()->toDateString(),
                'notes' => 'From Inertia',
            ],
        );

    $response->assertRedirect(route('service-charges.index'));
    $this->assertDatabaseHas('service_charges', [
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
    ]);
});

test('service charges index filters by status and search', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => 40,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => 60,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'paid',
    ]);

    $this->actingAs($user)
        ->get(route('service-charges.index', ['status' => 'unpaid']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.unpaid_count', 1)
            ->where('summary.paid_count', 0)
            ->has('charges.data', 1));

    $this->actingAs($user)
        ->get(route('service-charges.index', ['search' => 'Test Customer']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('charges.data', 2)
            ->where('statusCounts.all', 2));
});

test('authenticated user can open service charge print page', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => 25,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($user)
        ->get(route('service-charges.print', $charge))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service-charges/print')
            ->has('charge')
            ->where('charge.id', $charge->id));
});

test('authenticated user can view service charge show page', function () {
    $user = User::factory()->create();
    $customer = createCustomerForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => 75.50,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'due_date' => null,
        'status' => 'unpaid',
        'notes' => 'Pipe inspection fee',
    ]);

    $this->actingAs($user)
        ->get(route('service-charges.show', $charge))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('service-charges/show')
            ->has('charge')
            ->where('charge.id', $charge->id));
});

test('creating customer with initial service charge stores unpaid status', function () {
    $user = User::factory()->create();
    [$zone, $tariff] = createZoneAndTariffForServiceChargeTest();
    $chargeType = createServiceChargeTypeForTest();

    $response = $this->actingAs($user)->post(route('customers.store'), [
        'name' => 'New Customer With Charge',
        'phone' => '5551234567',
        'email' => null,
        'national_id' => null,
        'address' => null,
        'plot_no' => '12A',
        'customer_type' => 'residential',
        'status' => 'active',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'connection_date' => now()->toDateString(),
        'meter_setup_mode' => 'none',
        'apply_service_charge' => true,
        'service_charge_type_id' => $chargeType->id,
        'service_charge_amount' => 50.00,
    ]);

    $response->assertRedirect(route('customers.index'));

    $customer = Customer::query()->where('name', 'New Customer With Charge')->first();
    expect($customer)->not->toBeNull();

    $this->assertDatabaseHas('service_charges', [
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'status' => 'unpaid',
        'amount' => '50.00',
    ]);
});
