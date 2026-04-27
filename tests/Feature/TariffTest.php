<?php

use App\Models\Tariff;
use App\Models\User;

test('authenticated user can create a tariff', function () {
    $user = User::factory()->create();

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

test('authenticated user can update and delete a tariff', function () {
    $user = User::factory()->create();

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
