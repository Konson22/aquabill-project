<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Station;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\MeterReadingSeeder;
use Database\Seeders\PaymentSeeder;
use Database\Seeders\ServiceChargeSeeder;
use Database\Seeders\ServiceChargeTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function seedBillingPrerequisites(): void
{
    User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 100,
        'status' => 'active',
    ]);

    $zone = Zone::query()->create([
        'name' => 'Seeder Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    Station::factory()->create(['name' => 'Main branch']);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Seeder Customer',
        'phone' => '900000001',
        'address' => '1 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-SEED-01',
        'status' => 'active',
    ]);

    (new ServiceChargeTypeSeeder)->run();
}

test('meter reading seeder creates readings and bills', function () {
    seedBillingPrerequisites();

    (new MeterReadingSeeder)->run();

    expect(MeterReading::query()->count())->toBeGreaterThan(0);
    expect(Bill::query()->count())->toBeGreaterThan(0);
});

test('service charge and payment seeders create charges and payments', function () {
    seedBillingPrerequisites();

    (new MeterReadingSeeder)->run();
    (new ServiceChargeSeeder)->run();
    (new PaymentSeeder)->run();

    expect(ServiceCharge::query()->count())->toBeGreaterThan(0);
    expect(Payment::query()->count())->toBeGreaterThan(0);

    expect(Bill::query()->whereIn('status', ['paid', 'partial'])->exists())->toBeTrue();
    expect(ServiceCharge::query()->where('status', 'paid')->exists())->toBeTrue();
    expect(ServiceCharge::query()->where('status', 'unpaid')->exists())->toBeTrue();
});

test('billing seeders are idempotent when data already exists', function () {
    seedBillingPrerequisites();

    (new MeterReadingSeeder)->run();
    (new ServiceChargeSeeder)->run();
    (new PaymentSeeder)->run();

    $readingCount = MeterReading::query()->count();
    $chargeCount = ServiceCharge::query()->count();
    $paymentCount = Payment::query()->count();

    (new MeterReadingSeeder)->run();
    (new ServiceChargeSeeder)->run();
    (new PaymentSeeder)->run();

    expect(MeterReading::query()->count())->toBe($readingCount);
    expect(ServiceCharge::query()->count())->toBe($chargeCount);
    expect(Payment::query()->count())->toBe($paymentCount);
});
