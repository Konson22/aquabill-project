<?php

use App\Models\Customer;
use App\Models\Disconnection;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

function makeCustomer(string $name, string $status, Zone $zone, Tariff $tariff): Customer
{
    return Customer::query()->create([
        'customer_type' => 'residential',
        'name' => $name,
        'phone' => fake()->phoneNumber(),
        'address' => '123 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => $status,
    ]);
}

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->zone = Zone::query()->create([
        'name' => 'Tab Test Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);
    $this->tariff = Tariff::query()->create([
        'name' => 'Residential Tab',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $this->activeOne = makeCustomer('Active One', 'active', $this->zone, $this->tariff);
    $this->activeTwo = makeCustomer('Active Two', 'active', $this->zone, $this->tariff);
    $this->inactiveOne = makeCustomer('Inactive One', 'inactive', $this->zone, $this->tariff);
    $this->notifiedCustomer = makeCustomer('Notified Person', 'active', $this->zone, $this->tariff);
    $this->disconnectedCustomer = makeCustomer('Disconnected Person', 'active', $this->zone, $this->tariff);

    Disconnection::query()->create([
        'customer_id' => $this->notifiedCustomer->id,
        'status' => 'notified',
        'notified_at' => now(),
    ]);
    Disconnection::query()->create([
        'customer_id' => $this->disconnectedCustomer->id,
        'status' => 'disconnected',
        'disconnected_at' => now(),
    ]);
});

test('customers index returns tab counts for every defined tab', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('customers/index')
            ->where('tabCounts.all', 5)
            ->where('tabCounts.active', 4)
            ->where('tabCounts.inactive', 1)
            ->where('tabCounts.notified', 1)
            ->where('tabCounts.disconnected', 1)
            ->where('filters.tab', 'all')
        );
});

test('customers index filters to active customers when tab=active', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['tab' => 'active']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 4)
            ->where('filters.tab', 'active')
        );
});

test('customers index filters to inactive customers when tab=inactive', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['tab' => 'inactive']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.id', $this->inactiveOne->id)
        );
});

test('customers index filters to notified customers when tab=notified', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['tab' => 'notified']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.id', $this->notifiedCustomer->id)
        );
});

test('customers index filters to disconnected customers when tab=disconnected', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['tab' => 'disconnected']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.id', $this->disconnectedCustomer->id)
        );
});

test('customers index falls back to all when tab is unknown', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['tab' => 'totally-not-a-tab']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 5)
            ->where('filters.tab', 'all')
        );
});

test('customers index tab counts respect search filter', function () {
    $this->actingAs($this->user)
        ->get(route('customers.index', ['search' => 'Notified']))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('tabCounts.all', 1)
            ->where('tabCounts.active', 1)
            ->where('tabCounts.notified', 1)
            ->where('tabCounts.disconnected', 0)
            ->has('customers.data', 1)
        );
});
