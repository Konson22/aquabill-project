<?php

use App\Models\Department;
use App\Models\Tariff;
use App\Models\User;

test('admin department user can create a tariff', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Administration',
    ]);

    $user = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

    $response = $this->actingAs($user)->post(route('tariffs.store'), [
        'name' => 'COMMERCIAL-NEW',
        'price_per_unit' => 75.50,
        'fixed_charge' => 1200,
    ]);

    $response->assertRedirect();

    $tariff = Tariff::query()->where('name', 'COMMERCIAL-NEW')->first();

    expect($tariff)->not->toBeNull();
    expect((float) $tariff->price_per_unit)->toBe(75.5);
    expect((float) $tariff->fixed_charge)->toBe(1200.0);
});

test('admin department user can update and delete a tariff', function () {
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Administration',
    ]);

    $user = User::factory()->create([
        'department_id' => $adminDept->id,
    ]);

    $tariff = Tariff::create([
        'name' => 'TO-UPDATE',
        'price_per_unit' => 10,
        'fixed_charge' => 5,
    ]);

    $this->actingAs($user)->put(route('tariffs.update', $tariff), [
        'name' => 'UPDATED',
        'price_per_unit' => 20,
        'fixed_charge' => 7,
    ])->assertRedirect();

    $tariff->refresh();
    expect($tariff->name)->toBe('UPDATED');

    $this->actingAs($user)->delete(route('tariffs.destroy', $tariff))->assertRedirect();
    expect(Tariff::query()->whereKey($tariff->id)->exists())->toBeFalse();
});

test('non-admin department cannot create update or delete tariffs', function () {
    $financeDept = Department::query()->create([
        'name' => 'finance',
        'description' => 'Finance',
    ]);

    $user = User::factory()->create([
        'department_id' => $financeDept->id,
    ]);

    $response = $this->actingAs($user)->post(route('tariffs.store'), [
        'name' => 'SHOULD-NOT-EXIST',
        'price_per_unit' => 1,
        'fixed_charge' => 1,
    ]);

    $response->assertForbidden();

    expect(Tariff::query()->where('name', 'SHOULD-NOT-EXIST')->exists())->toBeFalse();

    $tariff = Tariff::create([
        'name' => 'LOCKED',
        'price_per_unit' => 10,
        'fixed_charge' => 5,
    ]);

    $this->actingAs($user)->put(route('tariffs.update', $tariff), [
        'name' => 'HACKED',
        'price_per_unit' => 99,
        'fixed_charge' => 99,
    ])->assertForbidden();

    $tariff->refresh();
    expect($tariff->name)->toBe('LOCKED');

    $this->actingAs($user)->delete(route('tariffs.destroy', $tariff))->assertForbidden();
    expect(Tariff::query()->whereKey($tariff->id)->exists())->toBeTrue();
});
