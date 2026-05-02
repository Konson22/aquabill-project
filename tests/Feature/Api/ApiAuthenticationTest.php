<?php

use App\Models\User;

test('api login accepts name as email and password', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'name' => $user->email,
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonStructure(['access_token', 'user']);
});

test('api login accepts email and password', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', true)
        ->assertJsonStructure(['access_token', 'user']);
});

test('api login rejects invalid credentials', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'name' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized();
});
