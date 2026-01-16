<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MeterController;
use App\Http\Controllers\MeterReadingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\FinanceDashboardController;
use App\Http\Controllers\MeterDepartmentDashboardController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('docs', function () {
        return Inertia::render('docs/index');
    })->name('docs.index');

    Route::get('docs/system', function () {
        return Inertia::render('docs/system-documentation');
    })->name('docs.system');

    // Dashboards
    Route::get('/api/h/search', [HomeController::class, 'search'])->name('homes.search');
    Route::get('/api/m/search', [MeterController::class, 'search'])->name('meters.search');
    // Admin Routes
    Route::middleware(['department:admin'])->group(function () {
        // Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::middleware(['department:finance'])->group(function () {
        // Route::get('finance/dashboard', [FinanceDashboardController::class, 'index'])->name('finance');
        Route::get('finance/overview', [FinanceDashboardController::class, 'overview'])->name('finance.overview');
        
        // Bills
        Route::get('bills', [BillController::class, 'index'])->name('bills');
        Route::get('bills/report', [BillController::class, 'report'])->name('bills.report');
        Route::get('bills/bulk-print', [BillController::class, 'bulkPrint'])->name('bills.bulk-print');
        Route::get('bills/export', [BillController::class, 'export'])->name('bills.export');
        Route::get('bills/{id}', [BillController::class, 'show'])->name('bills.show');
        Route::get('bills/{id}/print', [BillController::class, 'print'])->name('bills.print');
        Route::delete('bills/{id}', [BillController::class, 'destroy'])->name('bills.destroy');

        // Invoices
        Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices');
        Route::post('invoices', [InvoiceController::class, 'store'])->name('invoices.store');
        Route::get('invoices/bulk-print', [InvoiceController::class, 'bulkPrint'])->name('invoices.bulk-print');
        Route::get('invoices/{id}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('invoices/{id}/print', [InvoiceController::class, 'print'])->name('invoices.print');
        Route::delete('invoices/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

        // Payments
        // Payments
        Route::get('payments', [PaymentController::class, 'index'])->name('payments');
        Route::get('payments/export', [PaymentController::class, 'export'])->name('payments.export');
        Route::get('payments/report', [PaymentController::class, 'report'])->name('payments.report');
        Route::post('payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('payments/{id}', [PaymentController::class, 'show'])->name('payments.show');

        // Tariffs
        Route::get('tariffs', [TariffController::class, 'index'])->name('tariffs.index');
        Route::post('tariffs', [TariffController::class, 'store'])->name('tariffs.store');
        Route::get('tariffs/{tariff}', [TariffController::class, 'show'])->name('tariffs.show');
        Route::get('tariffs/{tariff}/print', [TariffController::class, 'print'])->name('tariffs.print');
        Route::put('tariffs/{tariff}', [TariffController::class, 'update'])->name('tariffs.update');
    });

    Route::middleware(['department:meters,admin'])->group(function () {
        // Route::get('meter-department/dashboard', [MeterDepartmentDashboardController::class, 'index'])->name('meter-department');
        
        // Meters
        Route::get('meters', [MeterController::class, 'index'])->name('meters');
        Route::get('meters/export', [MeterController::class, 'export'])->name('meters.export');
        Route::post('meters', [MeterController::class, 'store'])->name('meters.store');
        Route::put('meters/{id}', [MeterController::class, 'update'])->name('meters.update');
        Route::get('meters/{id}', [MeterController::class, 'show'])->name('meters.show');
        Route::delete('meters/{id}', [MeterController::class, 'destroy'])->name('meters.destroy');

        // Meter Readings
        Route::get('meter-readings', [MeterReadingController::class, 'index'])->name('meter-readings');
        Route::get('meter-readings/report', [MeterReadingController::class, 'report'])->name('meter-readings.report');
        Route::get('meter-readings/export', [MeterReadingController::class, 'export'])->name('meter-readings.export');
        Route::post('meter-readings', [MeterReadingController::class, 'store'])->name('meter-readings.store');
        Route::put('meter-readings/{id}', [MeterReadingController::class, 'update'])->name('meter-readings.update');
        Route::delete('meter-readings/{id}', [MeterReadingController::class, 'destroy'])->name('meter-readings.destroy');
        Route::get('meter-readings/{id}', [MeterReadingController::class, 'show'])->name('meter-readings.show');
    });

    // Zones
    Route::middleware(['department:admin,meters'])->group(function () {
        Route::get('zones', [ZoneController::class, 'index'])->name('zones.index');
        Route::post('zones', [ZoneController::class, 'store'])->name('zones.store');
        Route::get('zones/{id}', [ZoneController::class, 'show'])->name('zones.show');
        Route::put('zones/{id}', [ZoneController::class, 'update'])->name('zones.update');
        Route::delete('zones/{id}', [ZoneController::class, 'destroy'])->name('zones.destroy');
        
        // Areas
        Route::post('areas', [\App\Http\Controllers\AreaController::class, 'store'])->name('areas.store');
        Route::put('areas/{id}', [\App\Http\Controllers\AreaController::class, 'update'])->name('areas.update');
        Route::delete('areas/{id}', [\App\Http\Controllers\AreaController::class, 'destroy'])->name('areas.destroy');
    });

    // Customers
    Route::middleware(['department:finance,meters'])->group(function () {
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
        Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::get('customers/homes/{home}', [CustomerController::class, 'home'])->name('customers.home');
        Route::get('customers/{id}', [CustomerController::class, 'show'])->name('customers.show');
        Route::get('customers/{id}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('customers/{id}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');
        
        // Homes
        Route::get('homes', [HomeController::class, 'index'])->name('homes.index');
        Route::get('homes/export', [HomeController::class, 'export'])->name('homes.export');
        Route::post('homes', [HomeController::class, 'store'])->name('homes.store');
        Route::get('homes/{home}', [HomeController::class, 'show'])->name('homes.show');
        Route::get('homes/{home}/edit', [HomeController::class, 'edit'])->name('homes.edit');
        Route::put('homes/{home}', [HomeController::class, 'update'])->name('homes.update');
        Route::delete('homes/{home}', [HomeController::class, 'destroy'])->name('homes.destroy');
        Route::get('homes/{home}/meter/assign', [MeterController::class, 'assign'])->name('meters.assign');
    });

});

require __DIR__.'/settings.php';


