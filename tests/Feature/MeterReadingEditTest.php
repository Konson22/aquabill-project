<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function seedReadingEditScenario(): array
{
    $tariff = Tariff::query()->create([
        'name' => 'Residential ER',
        'price_per_unit' => 2,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Zone ER',
        'supply_day' => 'Monday',
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Edit Read Customer',
        'phone' => '123456789',
        'address' => '123 Main St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-ER-01',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
        'previous_reading' => 0,
        'current_reading' => 100,
        'notes' => 'original',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'meter_number' => $meter->meter_number,
        'reading_id' => $reading->id,
        'consumption' => 100,
        'unit_price' => 2,
        'fixed_charge' => 0,
        'current_charge' => 200,
        'previous_balance' => 0,
        'total_amount' => 200,
        'amount_paid' => 0,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    return compact('reading', 'bill');
}

test('reading edit page is shown for authenticated users', function () {
    $user = User::factory()->create();
    ['reading' => $reading] = seedReadingEditScenario();

    $response = $this->actingAs($user)->get(route('readings.edit', $reading));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('readings/edit')
        ->has('reading.id'));
});

test('reading update adjusts consumption and syncs linked bill', function () {
    $user = User::factory()->create();
    ['reading' => $reading, 'bill' => $bill] = seedReadingEditScenario();

    $response = $this->actingAs($user)->put(route('readings.update', $reading), [
        'previous_reading' => 0,
        'current_reading' => 120,
        'reading_date' => $reading->reading_date->toDateString(),
        'notes' => 'corrected',
    ]);

    $response->assertRedirect(route('readings.show', $reading));

    $reading->refresh();
    expect((float) $reading->consumption)->toBe(120.0);
    expect($reading->notes)->toBe('corrected');

    $bill->refresh();
    expect((float) $bill->consumption)->toBe(120.0);
    expect((float) $bill->current_charge)->toBe(240.0);
    expect((float) $bill->total_amount)->toBe(240.0);
});

test('reading update rejects current reading below previous', function () {
    $user = User::factory()->create();
    ['reading' => $reading] = seedReadingEditScenario();

    $this->actingAs($user)->put(route('readings.update', $reading), [
        'previous_reading' => 100,
        'current_reading' => 50,
        'reading_date' => $reading->reading_date->toDateString(),
        'notes' => null,
    ])->assertSessionHasErrors('current_reading');
});
