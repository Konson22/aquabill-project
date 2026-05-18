<?php

use App\Models\Bill;
use App\Models\Customer;
use App\Models\Department;
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

test('recording a bill payment creates a payments row linked to the bill', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Pay Table Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Pay Table Customer',
        'phone' => '100200300',
        'address' => '1 Pay St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-PAY-TABLE',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
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

    $this->actingAs($user)->post(route('bills.payments.store', $bill), [
        'amount' => 25,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'reference_number' => 'REF-001',
        'notes' => 'Partial pay',
    ])->assertRedirect();

    $payment = Payment::query()->where('payable_type', Bill::class)->where('payable_id', $bill->id)->first();
    expect($payment)->not->toBeNull();
    expect((float) $payment->amount)->toBe(25.0);
    expect((float) $payment->current_balance)->toBe(75.0);
    expect($payment->payment_method)->toBe('cash');
    expect($payment->reference_number)->toBe('REF-001');
    expect($payment->recorded_by)->toBe($user->id);

    $bill->refresh();
    expect((float) $bill->amount_paid)->toBe(25.0);
});

test('authenticated user can update a bill payment and bill status is recalculated', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);
    $user = User::factory()->create(['department_id' => $adminDept->id]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Edit Pay Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Edit Pay Customer',
        'phone' => '100200301',
        'address' => '1 Edit St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-EDIT-PAY',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
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
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $payment = $bill->payments()->create([
        'amount' => 40,
        'current_balance' => 60.0,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
        'reference_number' => 'OLD-REF',
    ]);

    $this->actingAs($user)->patch(route('bills.payments.update', [$bill, $payment]), [
        'amount' => 100,
        'payment_date' => '2026-05-10',
        'payment_method' => 'bank',
        'reference_number' => 'NEW-REF',
        'notes' => 'Corrected payment',
    ])->assertRedirect();

    $payment->refresh();
    $bill->refresh();

    expect((float) $payment->amount)->toBe(100.0);
    expect($payment->payment_method)->toBe('bank');
    expect($payment->reference_number)->toBe('NEW-REF');
    expect($payment->payment_date->toDateString())->toBe('2026-05-10');
    expect((float) $payment->current_balance)->toBe(0.0);
    expect($bill->status)->toBe('paid');
    expect((float) $bill->amount_paid)->toBe(100.0);
});

test('authenticated user can delete a bill payment and bill returns to pending when none remain', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);
    $user = User::factory()->create(['department_id' => $adminDept->id]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Delete Pay Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Delete Pay Customer',
        'phone' => '100200302',
        'address' => '1 Delete St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-DEL-PAY',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
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
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $payment = $bill->payments()->create([
        'amount' => 40,
        'current_balance' => 60.0,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $this->actingAs($user)->delete(route('bills.payments.destroy', [$bill, $payment]))->assertRedirect();

    expect(Payment::query()->whereKey($payment->id)->exists())->toBeFalse();

    $bill->refresh();
    expect($bill->status)->toBe('pending');
    expect($bill->payments()->count())->toBe(0);
});

test('non-admin users cannot update bill payments', function () {
    $financeDept = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);
    $user = User::factory()->create(['department_id' => $financeDept->id]);

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Finance Pay Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'Finance Pay Customer',
        'phone' => '100200303',
        'address' => '1 Finance St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $meter = Meter::query()->create([
        'customer_id' => $customer->id,
        'meter_number' => 'MTR-FIN-PAY',
        'status' => 'active',
    ]);

    $reading = MeterReading::query()->create([
        'meter_id' => $meter->id,
        'reading_date' => now()->toDateString(),
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
        'status' => 'partial',
        'due_date' => now()->addDays(30)->toDateString(),
    ]);

    $payment = $bill->payments()->create([
        'amount' => 40,
        'current_balance' => 60.0,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ]);

    $this->actingAs($user)->patch(route('bills.payments.update', [$bill, $payment]), [
        'amount' => 50,
        'payment_date' => now()->toDateString(),
        'payment_method' => 'cash',
    ])->assertForbidden();
});

test('confirming a service charge creates a payments row linked to the charge', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC-SC',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Pay SC Zone',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SC Pay Customer',
        'phone' => '400500600',
        'address' => '2 SC St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $type = ServiceChargeType::query()->create([
        'name' => 'Connection Fee',
        'code' => 'CONN',
        'amount' => 75.50,
    ]);

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $type->id,
        'amount' => 75.50,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($user)->post(route('service-charges.confirm-payment', $charge->id))->assertRedirect();

    $payment = Payment::query()->where('payable_type', ServiceCharge::class)->where('payable_id', $charge->id)->first();
    expect($payment)->not->toBeNull();
    expect((float) $payment->amount)->toBe(75.5);
    expect((float) $payment->current_balance)->toBe(0.0);
    expect($payment->payment_method)->toBe('cash');

    expect($charge->fresh()->status)->toBe('paid');
});

test('confirming an already paid service charge does not create another payment', function () {
    $user = User::factory()->create();

    $tariff = Tariff::query()->create([
        'name' => 'DOMESTIC-SC2',
        'price_per_unit' => 50,
        'fixed_charge' => 0,
    ]);

    $zone = Zone::query()->create([
        'name' => 'Pay SC Zone 2',
        'supply_day_id' => supplyDayId('Monday'),
        'supply_time' => '08:00:00',
    ]);

    $customer = Customer::query()->create([
        'customer_type' => 'residential',
        'name' => 'SC Pay Customer 2',
        'phone' => '700800900',
        'address' => '3 SC St',
        'zone_id' => $zone->id,
        'tariff_id' => $tariff->id,
        'status' => 'active',
    ]);

    $type = ServiceChargeType::query()->create([
        'name' => 'Reconnection',
        'code' => 'RECON',
        'amount' => 20,
    ]);

    $charge = ServiceCharge::query()->create([
        'customer_id' => $customer->id,
        'service_charge_type_id' => $type->id,
        'amount' => 20,
        'issued_by' => $user->id,
        'issued_date' => now()->toDateString(),
        'status' => 'paid',
    ]);

    $this->actingAs($user)->post(route('service-charges.confirm-payment', $charge->id))->assertRedirect();

    expect(Payment::query()->where('payable_type', ServiceCharge::class)->where('payable_id', $charge->id)->count())->toBe(0);
});
