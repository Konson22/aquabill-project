<?php

use Database\Seeders\AppSettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('app settings table exists with expected columns', function () {
    expect(Schema::hasTable('app_settings'))->toBeTrue();
    expect(Schema::hasColumns('app_settings', [
        'billing_cycle',
        'billing_cycle_day',
        'current_billing_period_start',
        'current_billing_period_end',
        'financial_year_start_month',
        'financial_year_start_day',
        'disconnection_period_days',
        'grace_period_days',
    ]))->toBeTrue();
});

test('app setting seeder creates singleton row with configured defaults', function () {
    $this->seed(AppSettingSeeder::class);

    expect(DB::table('app_settings')->count())->toBe(1);

    $settings = DB::table('app_settings')->first();

    expect($settings->billing_cycle)->toBe('monthly');
    expect($settings->billing_cycle_day)->toBe(27);
    expect($settings->financial_year_start_month)->toBe(6);
    expect($settings->financial_year_start_day)->toBe(1);
    expect($settings->disconnection_period_days)->toBe(30);
    expect($settings->grace_period_days)->toBe(15);
    expect($settings->current_billing_period_start)->not->toBeNull();
    expect($settings->current_billing_period_end)->not->toBeNull();
});
