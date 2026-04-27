<?php

use App\Models\Tariff;
use App\Models\User;

test('authenticated user can view tariff show page', function () {
    $user = User::factory()->create();

    $tariff = Tariff::create([
        'name' => 'DOMESTIC-SHOW',
        'price_per_unit' => 45,
        'fixed_charge' => 100,
    ]);

    $response = $this->actingAs($user)->get(route('tariffs.show', $tariff));

    $response->assertOk();
    $response->assertSee('DOMESTIC-SHOW');
});
