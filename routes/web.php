<?php

use App\Http\Controllers\Admin\AreaController;
use App\Http\Controllers\Admin\MeterReadingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Finance\BillController;
use App\Http\Controllers\Finance\CustomerController;
use App\Http\Controllers\Finance\FinanceDashboardController;
use App\Http\Controllers\Finance\InvoiceController;
use App\Http\Controllers\Finance\MeterController;
use App\Http\Controllers\Finance\PaymentController;
use App\Http\Controllers\Finance\TariffController;
use App\Http\Controllers\MeterDepartmentDashboardController;
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

    // Documentation: not under resources/js/pages/finance — admin & meter staff only
    Route::middleware(['department:admin,meters'])->group(function () {
        Route::get('docs', function () {
            return Inertia::render('docs/index');
        })->name('docs.index');

        Route::get('docs/system', function () {
            return Inertia::render('docs/system-documentation');
        })->name('docs.system');

        Route::get('docs/user-manual', function () {
            return Inertia::render('docs/user-manual-documentation');
        })->name('docs.user-manual');

        Route::get('docs/system-core-functionalities', function () {
            return Inertia::render('docs/system-core-functionalities-doc');
        })->name('docs.system-core-functionalities');

        Route::get('docs/development-status', function () {
            return Inertia::render('documentation/manual');
        })->name('docs.development-status');

        Route::get('docs/technical-docs', function () {
            return Inertia::render('documentation/TechnicalDocumentation');
        })->name('docs.technical');

        Route::get('docs/process-governance', function () {
            return Inertia::render('documentation/ProcessGovernance');
        })->name('docs.process-governance');
    });

    // Search (customer search used by invoice modal; homes.search kept for backward compatibility)
    Route::get('/api/h/search', [CustomerController::class, 'search'])->name('homes.search');
    Route::get('/api/customers/search', [CustomerController::class, 'search'])->name('customers.search');
    Route::get('/api/m/search', [MeterController::class, 'search'])->name('meters.search');
    // Admin Routes
    Route::middleware(['department:admin'])->group(function () {
        // Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('general-report', [DashboardController::class, 'generalReport'])->name('general-report');
        Route::get('general-report/export', [DashboardController::class, 'exportGeneralReport'])->name('general-report.export');
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    // Finance hub: accessible by both admin and finance
    Route::middleware(['department:admin,finance'])->group(function () {
        Route::get('finance', [FinanceDashboardController::class, 'hub'])->name('finance');
    });

    Route::middleware(['department:finance'])->group(function () {
        Route::get('finance/overview', [FinanceDashboardController::class, 'overview'])->name('finance.overview');

        // Bills
        Route::get('bills', [BillController::class, 'index'])->name('bills');
        Route::get('bills/unpaid', fn () => redirect()->route('bills', ['status' => 'unpaid']));
        Route::get('bills/paid', fn () => redirect()->route('bills', ['status' => 'fully paid']));
        Route::get('bills/forwarded', fn () => redirect()->route('bills', ['status' => 'forwarded_group']));
        Route::get('bills/printing-list', [BillController::class, 'printingList'])->name('bills.printing-list');
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
        Route::delete('payments/{id}', [PaymentController::class, 'destroy'])->name('payments.destroy');

        // Tariffs
        Route::get('tariffs', [TariffController::class, 'index'])->name('tariffs.index');
        Route::post('tariffs', [TariffController::class, 'store'])->name('tariffs.store');
        Route::get('tariffs/{tariff}', [TariffController::class, 'show'])->name('tariffs.show');
        Route::get('tariffs/{tariff}/print', [TariffController::class, 'print'])->name('tariffs.print');
        Route::put('tariffs/{tariff}', [TariffController::class, 'update'])->name('tariffs.update');
    });

    Route::middleware(['department:meters,admin'])->group(function () {
        // Route::get('meter-department/dashboard', [MeterDepartmentDashboardController::class, 'index'])->name('meter-department');

        Route::get('dashboard-meter-department/customers', [CustomerController::class, 'indexForMeterDepartment'])->name('dashboard-meter-department.customers.index');

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
        Route::get('meter-readings/{id}/image', [MeterReadingController::class, 'image'])->name('meter-readings.image');
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
        Route::post('areas', [AreaController::class, 'store'])->name('areas.store');
        Route::put('areas/{id}', [AreaController::class, 'update'])->name('areas.update');
        Route::delete('areas/{id}', [AreaController::class, 'destroy'])->name('areas.destroy');
    });

    // Customers
    Route::middleware(['department:finance,meters'])->group(function () {
        Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
        Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create');
        Route::get('customers/homes/{id}', [CustomerController::class, 'home'])->name('customers.home');
        Route::get('customers/{id}', [CustomerController::class, 'show'])->name('customers.show');
        Route::get('customers/{id}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
        Route::put('customers/{id}', [CustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{id}', [CustomerController::class, 'destroy'])->name('customers.destroy');

        // Homes (merged into customers: same controller, old URLs still work)
        Route::get('homes', [CustomerController::class, 'index'])->name('homes.index');
        Route::get('homes/export', [CustomerController::class, 'export'])->name('homes.export');
        Route::get('homes/{id}', [CustomerController::class, 'show'])->name('homes.show');
        Route::get('homes/{id}/edit', [CustomerController::class, 'edit'])->name('homes.edit');
        Route::put('homes/{id}', [CustomerController::class, 'update'])->name('homes.update');
        Route::delete('homes/{id}', [CustomerController::class, 'destroy'])->name('homes.destroy');
        Route::get('homes/{home}/meter/assign', [MeterController::class, 'assign'])->name('meters.assign');
    });

});

require __DIR__.'/settings.php';
