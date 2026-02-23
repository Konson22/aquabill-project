<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Resolve route param 'home' as Customer (for meters.assign; homes merged into customers)
        Route::bind('home', function ($value) {
            return \App\Models\Customer::findOrFail($value);
        });
    }
}
