<?php

use App\Models\AppSetting;
use App\Models\Department;
use App\Models\User;
use Database\Seeders\AppSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createAdminUserForAppSettings(): User
{
    $adminDept = Department::query()->create([
        'name' => 'admin',
        'description' => 'Admin',
    ]);

    return User::factory()->create([
        'department_id' => $adminDept->id,
    ]);
}

test('guest cannot access billing cycle settings', function () {
    $this->get(route('admin.billing-cycle.edit'))->assertRedirect();
});

test('admin can view billing cycle settings page', function () {
    $this->seed(AppSettingSeeder::class);

    $this->actingAs(createAdminUserForAppSettings())
        ->get(route('admin.billing-cycle.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/setting/billing-cycle')
            ->has('settings.billing_cycle')
            ->has('settings.billing_cycle_day')
            ->has('settings.current_billing_period_start')
            ->has('settings.current_billing_period_end'));
});

test('admin can update billing cycle settings', function () {
    $this->seed(AppSettingSeeder::class);
    $user = createAdminUserForAppSettings();

    $this->actingAs($user)
        ->from(route('admin.billing-cycle.edit'))
        ->put(route('admin.billing-cycle.update'), [
            'billing_cycle' => 'monthly',
            'billing_cycle_day' => 15,
        ])
        ->assertRedirect(route('admin.billing-cycle.edit'))
        ->assertSessionHas('success');

    $settings = AppSetting::current();

    expect($settings->billing_cycle)->toBe('monthly');
    expect($settings->billing_cycle_day)->toBe(15);
    expect($settings->current_billing_period_start)->not->toBeNull();
    expect($settings->current_billing_period_end)->not->toBeNull();
});

test('billing cycle day must be between 1 and 28', function () {
    $this->seed(AppSettingSeeder::class);

    $this->actingAs(createAdminUserForAppSettings())
        ->from(route('admin.billing-cycle.edit'))
        ->put(route('admin.billing-cycle.update'), [
            'billing_cycle' => 'monthly',
            'billing_cycle_day' => 31,
        ])
        ->assertSessionHasErrors('billing_cycle_day');
});
