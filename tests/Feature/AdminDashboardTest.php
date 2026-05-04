<?php

use App\Models\Customer;
use App\Models\Department;
use App\Models\Disconnection;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;

test('admin dashboard includes disconnection summary stats', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);

    $user = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

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
        'name' => 'Test Customer',
        'phone' => '123456789',
        'address' => 'Juba',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    Disconnection::query()->create([
        'customer_id' => $customer->id,
        'status' => 'notified',
        'notified_at' => now(),
        'notice_ends_at' => now()->addDays(30),
        'grace_period_ends_at' => now()->addDays(45),
        'disconnected_by' => $user->id,
    ]);

    Disconnection::query()->create([
        'customer_id' => $customer->id,
        'status' => 'disconnected',
        'notified_at' => now()->subDays(40),
        'notice_ends_at' => now()->subDays(10),
        'grace_period_ends_at' => now()->subDay(),
        'disconnected_at' => now(),
        'disconnected_by' => $user->id,
        'reason' => 'Test',
    ]);

    $response = $this->actingAs($user)->get(route('admin'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard')
        ->has('revenueBillCounts')
        ->where('revenueBillCounts.paid', 0)
        ->where('revenueBillCounts.unpaid', 0)
        ->where('revenueBillCounts.total', 0)
        ->where('revenueBillCounts.collection_rate_percent', 0)
        ->where('disconnectionStats.notified', 1)
        ->where('disconnectionStats.disconnected', 1)
        ->where('disconnectionStats.grace_period', 0)
        ->has('notifiedCustomers', 1)
        ->where('notifiedCustomers.0.customer_name', 'Test Customer')
        ->has('disconnectedCustomers', 1)
        ->where('disconnectedCustomers.0.customer_name', 'Test Customer'));
});

test('non-admin cannot access admin dashboard', function () {
    $finance = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $finance->id,
    ]);

    $this->actingAs($user)->get(route('admin'))->assertForbidden();
});
