<?php

use App\Http\Controllers\Admin\StationController as AdminStationController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AppSettingController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BillPaymentController;
use App\Http\Controllers\ConnectionRequestController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDisconnectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Departments\AdminController;
use App\Http\Controllers\Departments\CustomerCareController;
use App\Http\Controllers\Departments\DepartmentWorkspaceController;
use App\Http\Controllers\Departments\FinanceController;
use App\Http\Controllers\Departments\FinanceReportController;
use App\Http\Controllers\Departments\HRController;
use App\Http\Controllers\Departments\LedgerController;
use App\Http\Controllers\Gis\GisDashboardController;
use App\Http\Controllers\Gis\GisMapController;
use App\Http\Controllers\Gis\GisZoneBoundaryController;
use App\Http\Controllers\Gis\PipeController as GisPipeController;
use App\Http\Controllers\Gis\ValveController as GisValveController;
use App\Http\Controllers\Gis\WaterPointController as GisWaterPointController;
use App\Http\Controllers\Gis\WaterPointTypeController as GisWaterPointTypeController;
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
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/admin', [AdminController::class, 'index'])->middleware('department:admin')->name('admin');
    Route::get('/finance', [FinanceController::class, 'index'])->middleware('department:finance')->name('finance');
    Route::prefix('finance')->middleware('department:finance')->name('finance.')->group(function () {
        Route::get('/reports', [FinanceReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [FinanceReportController::class, 'export'])->name('reports.export');
    });
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

    Route::get('/water-quality', DepartmentWorkspaceController::class)->middleware('department:water_quality')->name('water-quality');
    Route::get('/water-purification', DepartmentWorkspaceController::class)->middleware('department:water_purification')->name('water-purification');
    Route::get('/stores', DepartmentWorkspaceController::class)->middleware('department:stores')->name('stores');

    Route::get('/water-report', [ReportController::class, 'waterUsage'])->name('water-report.index');
    Route::get('/water-report/export', [ReportController::class, 'exportWaterUsage'])->name('water-report.export');
    Route::get('/revenue-report', [ReportController::class, 'revenue'])->name('revenue-report.index');
    Route::get('/revenue-report/export', [ReportController::class, 'exportRevenue'])->name('revenue-report.export');
    Route::get('/payments-report', [ReportController::class, 'paymentsReport'])->name('payments-report.index');
    Route::get('/payments-report/export', [ReportController::class, 'exportPaymentsReport'])->name('payments-report.export');

    Route::get('/reports/water-usage', function (Request $request) {
        $params = [];

        if ($request->filled('month')) {
            $params['month'] = $request->string('month')->toString();
        } elseif ($request->filled('from')) {
            $params['month'] = Carbon::parse($request->string('from')->toString())->format('Y-m');
        }

        if ($request->filled('zone_id')) {
            $params['zone_id'] = $request->integer('zone_id');
        }

        if ($request->filled('tariff_id')) {
            $params['tariff_id'] = $request->integer('tariff_id');
        }

        return redirect()->route('water-report.index', $params);
    });
    Route::get('/reports/revenue', function (Request $request) {
        return redirect()->route('revenue-report.index', $request->query());
    });
    Route::get('/reports/revenue/export', function (Request $request) {
        return redirect()->route('revenue-report.export', $request->query());
    });
    Route::get('/reports/payments', function (Request $request) {
        return redirect()->route('payments-report.index', $request->query());
    });
    Route::get('/reports/payments/export', function (Request $request) {
        return redirect()->route('payments-report.export', $request->query());
    });

    Route::resource('customers', CustomerController::class)->only(['index', 'create', 'store', 'show', 'edit', 'update']);
    Route::get('customers/{customer}/disconnection-status', [CustomerDisconnectionController::class, 'disconnectionStatus'])->name('customers.disconnection-status');
    Route::get('customers/{customer}/print-notification', [CustomerDisconnectionController::class, 'printNotification'])->name('customers.print-notification');
    Route::get('disconnections', [CustomerDisconnectionController::class, 'index'])->name('disconnections.index');
    Route::post('customers/{customer}/notify-disconnection', [CustomerDisconnectionController::class, 'notify'])->name('customers.notify-disconnection');
    Route::post('customers/{customer}/cancel-disconnection-notice', [CustomerDisconnectionController::class, 'cancelNotice'])->name('customers.cancel-disconnection-notice');
    Route::post('customers/{customer}/disconnect', [CustomerDisconnectionController::class, 'disconnect'])->name('customers.disconnect');
    Route::post('customers/{customer}/reconnect', [CustomerDisconnectionController::class, 'reconnect'])->name('customers.reconnect');
    Route::get('customers/{customer}/service-charges/create', [ServiceChargeController::class, 'createForCustomer'])->name('customers.service-charges.create');
    Route::post('customers/{customer}/service-charges', [ServiceChargeController::class, 'store'])->name('customers.service-charges.store');
    Route::get('customers/{customer}/readings/export', [CustomerController::class, 'exportReadings'])->name('customers.readings.export');
    Route::get('customers/{customer}/payments/export', [CustomerController::class, 'exportPayments'])->name('customers.payments.export');
    Route::get('customers/{customer}/service-charges/export', [CustomerController::class, 'exportServiceCharges'])->name('customers.service-charges.export');
    Route::get('connection-requests', [ConnectionRequestController::class, 'index'])->name('connection-requests.index');
    Route::get('connection-requests/create', [ConnectionRequestController::class, 'create'])->name('connection-requests.create');
    Route::post('connection-requests', [ConnectionRequestController::class, 'store'])->name('connection-requests.store');
    Route::get('connection-requests/{connectionRequest}', [ConnectionRequestController::class, 'show'])->name('connection-requests.show');
    Route::get('connection-requests/{connectionRequest}/print', [ConnectionRequestController::class, 'print'])->name('connection-requests.print');
    Route::post('connection-requests/{connectionRequest}/mark-paid', [ConnectionRequestController::class, 'markPaid'])->name('connection-requests.mark-paid');
    Route::post('connection-requests/{connectionRequest}/convert', [ConnectionRequestController::class, 'convertToCustomer'])->name('connection-requests.convert');
    Route::post('connection-requests/{connectionRequest}/cancel', [ConnectionRequestController::class, 'cancel'])->name('connection-requests.cancel');
    Route::get('tariffs', [TariffController::class, 'index'])->name('tariffs.index');
    Route::get('tariffs/{tariff}', [TariffController::class, 'show'])->name('tariffs.show');
    Route::post('tariffs', [TariffController::class, 'store'])->middleware('department:admin')->name('tariffs.store');
    Route::match(['put', 'patch'], 'tariffs/{tariff}', [TariffController::class, 'update'])->middleware('department:admin')->name('tariffs.update');
    Route::delete('tariffs/{tariff}', [TariffController::class, 'destroy'])->middleware('department:admin')->name('tariffs.destroy');
    Route::post('meters/{meter}/replace', [MeterController::class, 'replace'])->name('meters.replace');
    Route::resource('meters', MeterController::class)->only(['index', 'store', 'show', 'update']);
    Route::get('readings/export', [MeterReadingController::class, 'export'])->name('readings.export');
    Route::get('readings/overdue/export', [MeterReadingController::class, 'exportOverdue'])->name('readings.overdue.export');
    Route::get('readings/overdue-readings', [MeterReadingController::class, 'overdue'])->name('readings.overdue');
    Route::resource('readings', MeterReadingController::class)->only(['index', 'store', 'show', 'edit', 'update']);
    Route::patch('zones/{zone}/boundary', [ZoneController::class, 'updateBoundary'])->name('zones.boundary.update');
    Route::resource('zones', ZoneController::class)->only(['index', 'store']);

    Route::prefix('gis')->name('gis.')->group(function () {
        Route::get('/', [GisDashboardController::class, 'index'])->name('dashboard');
        Route::get('/map', GisMapController::class)->name('map');
        Route::get('/zone-boundaries', GisZoneBoundaryController::class)->name('zone-boundaries');
        Route::resource('water-point-types', GisWaterPointTypeController::class);
        Route::resource('water-points', GisWaterPointController::class);
        Route::resource('pipes', GisPipeController::class);
        Route::resource('valves', GisValveController::class);
    });
    Route::post('service-charges/{service_charge}/confirm-payment', [ServiceChargeController::class, 'confirmPayment'])->name('service-charges.confirm-payment');
    Route::get('service-charges/{service_charge}/print', [ServiceChargeController::class, 'print'])->name('service-charges.print');
    Route::resource('service-charges', ServiceChargeController::class);
    Route::get('bills/export', [BillController::class, 'export'])->name('bills.export');
    Route::get('bills/{bill}/print', [BillController::class, 'print'])->name('bills.print');
    Route::get('bills/bulk-print', [BillController::class, 'bulkPrint'])->name('bills.bulk-print');
    Route::get('bills/printing-list', [BillController::class, 'printingList'])->name('bills.printing-list');
    Route::get('bills/overdue-bills', [BillController::class, 'overdue'])->name('bills.overdue');
    Route::post('bills/{bill}/payments', [BillPaymentController::class, 'store'])->name('bills.payments.store');
    Route::patch('bills/{bill}/payments/{payment}', [BillPaymentController::class, 'update'])
        ->middleware('department:admin')
        ->name('bills.payments.update');
    Route::delete('bills/{bill}/payments/{payment}', [BillPaymentController::class, 'destroy'])
        ->middleware('department:admin')
        ->name('bills.payments.destroy');
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

        Route::get('/settings/billing-cycle', [AppSettingController::class, 'edit'])->name('admin.billing-cycle.edit');
        Route::put('/settings/billing-cycle', [AppSettingController::class, 'update'])->name('admin.billing-cycle.update');

        Route::get('/stations', [AdminStationController::class, 'index'])->name('admin.stations.index');
        Route::post('/stations', [AdminStationController::class, 'store'])->name('admin.stations.store');

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
