<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BillPaymentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Departments\AdminController;
use App\Http\Controllers\Departments\CustomerCareController;
use App\Http\Controllers\Departments\FinanceController;
use App\Http\Controllers\Departments\HRController;
use App\Http\Controllers\Departments\LedgerController;
use App\Http\Controllers\MeterController;
use App\Http\Controllers\MeterReadingController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\ZoneController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/admin', [AdminController::class, 'index'])->middleware('department:admin')->name('admin');
    Route::get('/finance', [FinanceController::class, 'index'])->middleware('department:finance')->name('finance');
    Route::get('/ledger', [LedgerController::class, 'index'])->middleware('department:ledger')->name('ledger');
    Route::get('/hr', [HRController::class, 'index'])->middleware('department:hr')->name('hr');
    Route::get('/customer-care', [CustomerCareController::class, 'index'])->middleware('department:customer_care')->name('customer-care');

    Route::prefix('reports')->group(function () {
        Route::get('/revenue', function () {
            return Inertia\Inertia::render('reports/revenue');
        })->name('reports.revenue');

        Route::get('/water-usage', function () {
            return Inertia\Inertia::render('reports/water-usage');
        })->name('reports.water-usage');
    });

    Route::resource('customers', CustomerController::class)->only(['index', 'show']);
    Route::post('customers/{customer}/service-charges', [\App\Http\Controllers\ServiceChargeController::class, 'store'])->name('customers.service-charges.store');
    Route::resource('tariffs', TariffController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::resource('meters', MeterController::class)->only(['index']);
    Route::get('readings/export', [MeterReadingController::class, 'export'])->name('readings.export');
    Route::resource('readings', MeterReadingController::class)->only(['index', 'store', 'show']);
    Route::resource('zones', ZoneController::class)->only(['index']);
    Route::resource('service-charges', \App\Http\Controllers\ServiceChargeController::class);
    Route::get('bills/{bill}/print', [BillController::class, 'print'])->name('bills.print');
    Route::get('bills/bulk-print', [BillController::class, 'bulkPrint'])->name('bills.bulk-print');
    Route::get('bills/printing-list', [BillController::class, 'printingList'])->name('bills.printing-list');
    Route::get('bills/overdue-bills', [BillController::class, 'overdue'])->name('bills.overdue');
    Route::post('bills/{bill}/payments', [BillPaymentController::class, 'store'])->name('bills.payments.store');
    Route::resource('bills', BillController::class)->only(['index', 'show']);

    // Keeping these for now if needed, or we can move them inside admin prefix
    Route::prefix('admin')->middleware('department:admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');

        Route::get('/roles', function () {
            return Inertia\Inertia::render('admin/roles/index');
        })->name('roles.index');

        Route::get('/departments', function () {
            return Inertia\Inertia::render('admin/index'); // Fixed from departments/index
        })->name('departments.index');

        Route::get('/settings', function () {
            return Inertia\Inertia::render('admin/setting/index');
        })->name('admin.settings');

        Route::resource('settings/service-charges', \App\Http\Controllers\ServiceChargeTypeController::class)->names([
            'index' => 'admin.service-charges.index',
            'store' => 'admin.service-charges.store',
            'update' => 'admin.service-charges.update',
            'destroy' => 'admin.service-charges.destroy',
        ]);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
