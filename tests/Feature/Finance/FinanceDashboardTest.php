<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Department;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->department = Department::create(['name' => 'finance', 'description' => 'Finance']);
    $this->user = User::factory()->create(['department_id' => $this->department->id]);
});

test('finance dashboard loads with all expected props', function () {
    $this->actingAs($this->user)
        ->get(route('finance'))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('finance/dashboard')
            ->has('summary.total_revenue_collected')
            ->has('summary.outstanding_bills')
            ->has('summary.overdue_bills')
            ->has('summary.this_month_collected')
            ->has('summary.collection_rate')
            ->has('billStatusCounts.pending')
            ->has('billStatusCounts.partial')
            ->has('billStatusCounts.paid')
            ->has('billStatusCounts.overdue')
            ->has('billStatusAmounts.pending')
            ->has('billStatusAmounts.partial')
            ->has('billStatusAmounts.paid')
            ->has('monthlyCollectionSummary')
            ->has('zoneRevenueComparison')
        );
});

test('finance dashboard reflects bill data in summary', function () {
    $zone = Zone::create(['name' => 'Zone A']);
    $tariff = Tariff::create(['name' => 'Default', 'min_usage' => 0, 'max_usage' => 999, 'price_per_unit' => 10, 'fixed_charge' => 50]);

    $customer = Customer::create([
        'customer_type' => 'residential',
        'name' => 'John Doe',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
    ]);

    $meter = Meter::create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-FD-001',
    ]);

    $reading = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now(),
        'previous_reading' => 0,
        'current_reading' => 100,
    ]);

    $paidBill = Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 100,
        'unit_price' => 5,
        'fixed_charge' => 0,
        'current_charge' => 500,
        'previous_balance' => 0,
        'total_amount' => 500,
        'status' => 'paid',
        'due_date' => now()->addDays(30),
    ]);

    Payment::create([
        'payable_type' => Bill::class,
        'payable_id' => $paidBill->id,
        'amount' => 500,
        'payment_method' => 'cash',
        'payment_date' => now(),
        'reference' => 'REF-FD-001',
    ]);

    $reading2 = MeterReading::create([
        'meter_id' => $meter->id,
        'reading_date' => now()->subMonth(),
        'previous_reading' => 100,
        'current_reading' => 150,
    ]);

    Bill::create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading2->id,
        'consumption' => 50,
        'unit_price' => 6,
        'fixed_charge' => 0,
        'current_charge' => 300,
        'previous_balance' => 0,
        'total_amount' => 300,
        'status' => 'pending',
        'due_date' => now()->subDays(10),
    ]);

    $this->actingAs($this->user)
        ->get(route('finance'))
        ->assertSuccessful()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('finance/dashboard')
            ->where('summary.total_revenue_collected', fn ($v) => (float) $v === 500.0)
            ->where('summary.overdue_bills', 1)
            ->where('billStatusCounts.paid', 1)
            ->where('billStatusCounts.pending', 1)
            ->where('billStatusCounts.overdue', 1)
            ->where('billStatusCounts.partial', 0)
        );
});
