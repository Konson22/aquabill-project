<?php

use App\Models\Customer;
use App\Models\Disconnection;
use App\Models\Meter;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can view notified customers page', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone A',
    ]);

    $notifiedCustomer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Notified Account',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $activeCustomer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Active Account',
        'phone' => '987654321',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    Disconnection::query()->create([
        'customer_id' => $notifiedCustomer->id,
        'status' => 'notified',
        'notified_at' => now()->subDays(5),
        'notice_ends_at' => now()->addDays(25),
        'grace_period_ends_at' => now()->addDays(40),
        'reason' => 'Unpaid bills',
        'disconnected_by' => $user->id,
    ]);

    Disconnection::query()->create([
        'customer_id' => $activeCustomer->id,
        'status' => 'disconnected',
        'notified_at' => now()->subDays(45),
        'notice_ends_at' => now()->subDays(15),
        'grace_period_ends_at' => now()->subDay(),
        'disconnected_at' => now(),
        'reason' => 'Already disconnected',
        'disconnected_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('disconnections.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('connection-management/index')
        ->has('disconnections.data', 2));

    $rows = collect($response->inertiaProps('disconnections')['data']);
    expect($rows->contains(fn (array $r) => $r['status'] === 'notified' && $r['customer']['name'] === 'Notified Account'))->toBeTrue();
    expect($rows->contains(fn (array $r) => $r['status'] === 'disconnected' && $r['customer']['name'] === 'Active Account'))->toBeTrue();
});

test('guest is redirected from disconnected customers page', function () {
    $response = $this->get(route('disconnections.index'));

    $response->assertRedirect('/login');
});

test('authenticated user can view customer disconnection status page', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone Status Page',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Status Page Customer',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('customers.disconnection-status', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('customers/disconnection-status')
        ->has('customer.id'));
});

test('authenticated user can open printable disconnection notice in new tab', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone Print Notice',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Print Notice Customer',
        'phone' => '123456789',
        'address' => 'Juba, Plot 12',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    Disconnection::query()->create([
        'customer_id' => $customer->id,
        'status' => 'notified',
        'notified_at' => now()->subDays(2),
        'notice_ends_at' => now()->addDays(28),
        'grace_period_ends_at' => now()->addDays(43),
        'reason' => 'Outstanding balance',
        'disconnected_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('customers.print-notification', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('customers/print-notification')
        ->has('customer.id')
        ->where('activeNotice.status', 'notified'));
});

test('print notification page loads without active notice', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone No Notice',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'No Notice Customer',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get(route('customers.print-notification', $customer));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('customers/print-notification')
        ->where('activeNotice', null));
});

test('disconnect with meter removed unassigns customer meter', function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);

    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone A',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Meter Removal Account',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);
    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-REMOVE-001',
        'status' => 'active',
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('customers.disconnect', $customer), [
            'disconnection_type' => 'meter_removed',
            'reason' => 'Meter taken away',
        ]);

    $response->assertRedirect();
    expect($customer->fresh()->status)->toBe('disconnected');
    expect($meter->fresh()->customer_id)->toBeNull();
    expect($meter->fresh()->status)->toBe('inactive');
});

test('authenticated user can cancel an active disconnection notice', function () {
    $user = User::factory()->create();
    $tariff = Tariff::query()->create([
        'name' => 'Residential',
        'price_per_unit' => 100,
        'fixed_charge' => 200,
    ]);
    $zone = Zone::query()->create([
        'name' => 'Zone Cancel',
    ]);
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Noticed Account',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $disconnection = Disconnection::query()->create([
        'customer_id' => $customer->id,
        'status' => 'notified',
        'notified_at' => now()->subDays(5),
        'notice_ends_at' => now()->addDays(25),
        'grace_period_ends_at' => now()->addDays(40),
        'reason' => 'Unpaid bills',
        'disconnected_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->post(route('customers.cancel-disconnection-notice', $customer), [
        'notes' => 'Customer paid in full',
    ]);

    $response->assertRedirect();
    expect($disconnection->fresh()->status)->toBe('cancelled');
    expect($disconnection->fresh()->notes)->toContain('Customer paid in full');
});
