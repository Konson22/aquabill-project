<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can open payments report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('payments-report.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('payments-report/index')
            ->has('payments')
            ->has('summary')
            ->has('filters')
            ->has('filterOptions'));
});

test('payments report filters by date range zone tariff and recorded by user', function () {
    $cashierA = User::factory()->create(['name' => 'Cashier Alpha']);
    $cashierB = User::factory()->create(['name' => 'Cashier Beta']);

    $tariffA = Tariff::query()->create([
        'name' => 'Tariff A',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);
    $tariffB = Tariff::query()->create([
        'name' => 'Tariff B',
        'price_per_unit' => 20,
        'fixed_charge' => 0,
    ]);

    $zoneA = Zone::query()->create([
        'name' => 'Zone Alpha',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);
    $zoneB = Zone::query()->create([
        'name' => 'Zone Beta',
        'supply_day_id' => supplyDayId('Tuesday'),
        'supply_time' => '09:00:00',
    ]);

    $paymentInScope = createBillPaymentForReport(
        zone: $zoneA,
        tariff: $tariffA,
        recorder: $cashierA,
        amount: 50,
        paymentDate: '2026-05-10',
    );

    createBillPaymentForReport(
        zone: $zoneB,
        tariff: $tariffB,
        recorder: $cashierB,
        amount: 99,
        paymentDate: '2026-05-10',
    );

    createBillPaymentForReport(
        zone: $zoneA,
        tariff: $tariffA,
        recorder: $cashierA,
        amount: 25,
        paymentDate: '2026-04-01',
    );

    $this->actingAs(User::factory()->create());

    $this->get(route('payments-report.index', [
        'month' => '2026-05',
        'zone_id' => $zoneA->id,
        'tariff_id' => $tariffA->id,
        'recorded_by' => $cashierA->id,
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.payments_count', 1)
            ->where('summary.total_amount', 50)
            ->has('payments.data', 1)
            ->where('payments.data.0.id', $paymentInScope->id)
            ->where('payments.data.0.amount', 50)
            ->where('payments.data.0.zone_name', 'Zone Alpha')
            ->where('payments.data.0.tariff_name', 'Tariff A')
            ->where('payments.data.0.recorder_name', 'Cashier Alpha'));
});

test('payments report filters by payment type tab', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'Tab Tariff',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Tab Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $billPayment = createBillPaymentForReport(
        zone: $zone,
        tariff: $tariff,
        recorder: $user,
        amount: 40,
        paymentDate: '2026-05-12',
    );

    $serviceChargePayment = createServiceChargePaymentForReport(
        zone: $zone,
        tariff: $tariff,
        recorder: $user,
        amount: 75,
        paymentDate: '2026-05-12',
    );

    $this->actingAs($user);

    $this->get(route('payments-report.index', [
        'month' => '2026-05',
        'payment_type' => 'bill',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.payment_type', 'bill')
            ->where('summary.payments_count', 1)
            ->where('summary.total_amount', 40)
            ->has('payments.data', 1)
            ->where('payments.data.0.id', $billPayment->id));

    $this->get(route('payments-report.index', [
        'month' => '2026-05',
        'payment_type' => 'service_charge',
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.payment_type', 'service_charge')
            ->where('summary.payments_count', 1)
            ->where('summary.total_amount', 75)
            ->has('payments.data', 1)
            ->where('payments.data.0.id', $serviceChargePayment->id));
});

test('authenticated user can export payments report as xlsx', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'Export Tariff',
        'price_per_unit' => 10,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Export Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    createBillPaymentForReport(
        zone: $zone,
        tariff: $tariff,
        recorder: $user,
        amount: 100,
        paymentDate: '2026-05-10',
    );

    $response = $this->actingAs($user)->get(route('payments-report.export', [
        'month' => '2026-05',
    ]));

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('attachment');
    expect($response->headers->get('content-disposition'))->toContain('payments_report_');
    expect($response->headers->get('content-type'))->toContain('spreadsheetml');
});

function createBillPaymentForReport(
    Zone $zone,
    Tariff $tariff,
    User $recorder,
    float $amount,
    string $paymentDate,
): Payment {
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Report Customer '.$zone->id.'-'.$tariff->id,
        'phone' => '0900000000',
        'address' => '1 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-RPT-'.$zone->id.'-'.$tariff->id.'-'.uniqid(),
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => $paymentDate,
        'previous_reading' => 0,
        'current_reading' => 10,
        'notes' => 'Test',
    ]);

    $bill = Bill::query()->create([
        'customer_id' => $customer->id,
        'meter_id' => $meter->id,
        'reading_id' => $reading->id,
        'consumption' => 10,
        'unit_price' => 1,
        'fixed_charge' => 0,
        'current_charge' => 10,
        'previous_balance' => 0,
        'total_amount' => 100,
        'status' => 'pending',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    return Payment::query()->create([
        'payable_type' => Bill::class,
        'payable_id' => $bill->id,
        'amount' => $amount,
        'payment_date' => $paymentDate,
        'payment_method' => 'cash',
        'recorded_by' => $recorder->id,
    ]);
}

function createServiceChargePaymentForReport(
    Zone $zone,
    Tariff $tariff,
    User $recorder,
    float $amount,
    string $paymentDate,
): Payment {
    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SC Customer '.$zone->id.'-'.$tariff->id,
        'phone' => '0900000001',
        'address' => '2 Test St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $chargeType = ServiceChargeType::query()->create([
        'name' => 'Connection Fee',
        'code' => 'CONN-'.$zone->id,
        'amount' => $amount,
    ]);

    $serviceCharge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $chargeType->id,
        'amount' => $amount,
        'issued_by' => $recorder->id,
        'issued_date' => $paymentDate,
        'status' => 'paid',
    ]);

    return Payment::query()->create([
        'payable_type' => ServiceCharge::class,
        'payable_id' => $serviceCharge->id,
        'amount' => $amount,
        'payment_date' => $paymentDate,
        'payment_method' => 'cash',
        'recorded_by' => $recorder->id,
    ]);
}
