<?php

use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BillPaymentController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDisconnectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Departments\AdminController;
use App\Http\Controllers\Departments\CustomerCareController;
use App\Http\Controllers\Departments\FinanceController;
use App\Http\Controllers\Departments\HRController;
use App\Http\Controllers\Departments\LedgerController;
use App\Http\Controllers\HR\TrainingDocumentController;
use App\Http\Controllers\HR\TrainingParticipantController;
use App\Http\Controllers\HR\TrainingProgramController;
use App\Http\Controllers\HR\TrainingReportController;
use App\Http\Controllers\MeterController;
use App\Http\Controllers\MeterReadingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceChargeController;
use App\Http\Controllers\ServiceChargeTypeController;
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
    Route::prefix('hr')->middleware('department:hr')->group(function () {
        Route::get('/', [HRController::class, 'index'])->name('hr');
        Route::get('/departments', [HRController::class, 'departments'])->name('hr.departments.index');
        Route::post('/departments', [HRController::class, 'storeDepartment'])->name('hr.departments.store');
        Route::get('/staff/create', [HRController::class, 'staffCreate'])->name('hr.staff.create');
        Route::post('/staff', [HRController::class, 'staffStore'])->name('hr.staff.store');
        Route::get('/staff', [HRController::class, 'staffIndex'])->name('hr.staff.index');
        Route::get('/staff/{staff}', [HRController::class, 'staffShow'])->name('hr.staff.show');
        Route::get('/attendance', [HRController::class, 'attendance'])->name('hr.attendance.index');
        Route::get('/leave', [HRController::class, 'leave'])->name('hr.leave.index');
        Route::get('/payroll', [HRController::class, 'payroll'])->name('hr.payroll.index');
        Route::get('/documents', [HRController::class, 'documents'])->name('hr.documents.index');
        Route::get('/reports', [HRController::class, 'reports'])->name('hr.reports.index');

        Route::prefix('training')->name('hr.training.')->group(function () {
            Route::resource('programs', TrainingProgramController::class);
            Route::post('programs/{program}/participants', [TrainingParticipantController::class, 'store'])->name('programs.participants.store');
            Route::patch('programs/{program}/participants/{participant}', [TrainingParticipantController::class, 'update'])->name('programs.participants.update');
            Route::delete('programs/{program}/participants/{participant}', [TrainingParticipantController::class, 'destroy'])->name('programs.participants.destroy');
            Route::post('programs/{program}/documents', [TrainingDocumentController::class, 'store'])->name('programs.documents.store');
            Route::delete('programs/{program}/documents/{document}', [TrainingDocumentController::class, 'destroy'])->name('programs.documents.destroy');
            Route::get('reports', [TrainingReportController::class, 'index'])->name('reports.index');
        });
    });
    Route::get('/customer-care', [CustomerCareController::class, 'index'])->middleware('department:customer_care')->name('customer-care');

    Route::prefix('reports')->group(function () {
        Route::get('/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');

        Route::get('/water-usage', [ReportController::class, 'waterUsage'])->name('reports.water-usage');
    });

    Route::resource('customers', CustomerController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
    Route::get('customers/{customer}/disconnection-status', [CustomerDisconnectionController::class, 'disconnectionStatus'])->name('customers.disconnection-status');
    Route::get('customers/{customer}/print-notification', [CustomerDisconnectionController::class, 'printNotification'])->name('customers.print-notification');
    Route::get('disconnections', [CustomerDisconnectionController::class, 'index'])->name('disconnections.index');
    Route::post('customers/{customer}/notify-disconnection', [CustomerDisconnectionController::class, 'notify'])->name('customers.notify-disconnection');
    Route::post('customers/{customer}/cancel-disconnection-notice', [CustomerDisconnectionController::class, 'cancelNotice'])->name('customers.cancel-disconnection-notice');
    Route::post('customers/{customer}/disconnect', [CustomerDisconnectionController::class, 'disconnect'])->name('customers.disconnect');
    Route::post('customers/{customer}/reconnect', [CustomerDisconnectionController::class, 'reconnect'])->name('customers.reconnect');
    Route::post('customers/{customer}/service-charges', [ServiceChargeController::class, 'store'])->name('customers.service-charges.store');
    Route::get('tariffs', [TariffController::class, 'index'])->name('tariffs.index');
    Route::get('tariffs/{tariff}', [TariffController::class, 'show'])->name('tariffs.show');
    Route::post('tariffs', [TariffController::class, 'store'])->middleware('department:admin')->name('tariffs.store');
    Route::match(['put', 'patch'], 'tariffs/{tariff}', [TariffController::class, 'update'])->middleware('department:admin')->name('tariffs.update');
    Route::delete('tariffs/{tariff}', [TariffController::class, 'destroy'])->middleware('department:admin')->name('tariffs.destroy');
    Route::post('meters/{meter}/replace', [MeterController::class, 'replace'])->name('meters.replace');
    Route::resource('meters', MeterController::class)->only(['index', 'store', 'update']);
    Route::get('readings/export', [MeterReadingController::class, 'export'])->name('readings.export');
    Route::resource('readings', MeterReadingController::class)->only(['index', 'store', 'show', 'edit', 'update']);
    Route::resource('zones', ZoneController::class)->only(['index', 'store']);
    Route::post('service-charges/{service_charge}/confirm-payment', [ServiceChargeController::class, 'confirmPayment'])->name('service-charges.confirm-payment');
    Route::resource('service-charges', ServiceChargeController::class);
    Route::get('bills/{bill}/print', [BillController::class, 'print'])->name('bills.print');
    Route::get('bills/bulk-print', [BillController::class, 'bulkPrint'])->name('bills.bulk-print');
    Route::get('bills/printing-list', [BillController::class, 'printingList'])->name('bills.printing-list');
    Route::get('bills/overdue-bills', [BillController::class, 'overdue'])->name('bills.overdue');
    Route::post('bills/{bill}/payments', [BillPaymentController::class, 'store'])->name('bills.payments.store');
    Route::resource('bills', BillController::class)->only(['index', 'show']);

    // Keeping these for now if needed, or we can move them inside admin prefix
    Route::prefix('admin')->middleware('department:admin')->group(function () {
        Route::resource('/users', AdminUserController::class);

        Route::get('/roles', function () {
            return Inertia\Inertia::render('admin/roles/index');
        })->name('roles.index');

        Route::get('/departments', function () {
            return Inertia\Inertia::render('admin/index'); // Fixed from departments/index
        })->name('departments.index');

        Route::get('/settings', function () {
            return Inertia\Inertia::render('admin/setting/index');
        })->name('admin.settings');

        Route::resource('settings/service-charges', ServiceChargeTypeController::class)->only([
            'index',
            'store',
            'update',
            'destroy',
        ])->names([
            'index' => 'admin.service-charges.index',
            'store' => 'admin.service-charges.store',
            'update' => 'admin.service-charges.update',
            'destroy' => 'admin.service-charges.destroy',
        ]);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
