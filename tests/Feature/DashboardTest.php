<?php

use App\Models\Department;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('distribution department users see the distribution dashboard', function () {
    $dept = Department::query()->create([
        'name' => 'distribution',
        'description' => 'Water network distribution',
    ]);
    $user = User::factory()->create(['department_id' => $dept->id]);

    $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn ($page) => $page->component('distribution/dashboard'));
});
