<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can open revenue report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/revenue')->assertOk();
});

test('authenticated user can open water usage report page', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/reports/water-usage')->assertOk();
});
