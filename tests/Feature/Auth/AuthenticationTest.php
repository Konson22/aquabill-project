<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

beforeEach(function () {
    $this->withoutMiddleware(ValidateCsrfToken::class);
});

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('login accepts plain password seed pattern with hashed cast and verified email', function () {
    $dept = Department::query()->create([
        'name' => 'hr',
        'description' => 'HR',
    ]);

    User::query()->create([
        'name' => 'Seed Pattern',
        'email' => 'seed-pattern@test.local',
        'password' => '123',
        'department_id' => $dept->id,
        'status' => 'active',
        'email_verified_at' => now(),
    ]);

    $response = $this->post('/login', [
        'email' => 'seed-pattern@test.local',
        'password' => '123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
});
