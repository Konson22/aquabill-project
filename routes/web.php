<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MeterController;
// use App\Http\Controllers\BillController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\MeterReadingController;
use App\Http\Controllers\MeterLogController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryTransactionController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\MaintenanceRequestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DocumentationController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\FinanceController;




Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/api', [DashboardController::class, 'api'])->name('dashboard.api');
    Route::get('/statistics', [DashboardController::class, 'statistics'])->name('statistics.index');
    Route::get('/documentation', [DocumentationController::class, 'index'])->name('documentation');
    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/print-multiple', [BillingController::class, 'printMultiple'])->name('billing.print-multiple');
    Route::get('/billing/{bill}', [BillingController::class, 'show'])->whereNumber('bill')->name('billing.show');
    Route::get('/billing-range', [BillingController::class, 'range'])->name('billing.range');
    Route::get('/billing-range/export', [BillingController::class, 'exportRange'])->name('billing.range.export');
    Route::get('/billing/{bill}/print', [BillingController::class, 'print'])->whereNumber('bill')->name('billing.print');
    // Test route for department access control
    Route::get('/test-department-access', function () {
        $user = auth()->user();
        return response()->json([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'department' => $user->department ? $user->department->name : 'No department',
            'roles' => $user->roles->pluck('name')->toArray(),
        ]);
    })->name('test.department.access');

    
    // Custom readings routes (must be before resource routes)
    Route::get('/readings/statistics', [MeterReadingController::class, 'statistics'])->name('readings.statistics');
    
    // Core Billing System
    // Invoice print route
    Route::get('/invoices/{invoice}/print', [InvoiceController::class, 'print'])->name('invoices.print');

    // Apply department restrictions to core resources
    Route::middleware(['department.restriction'])->group(function () {
        // Finance route - restricted from Billing department
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::resources([
            '/customers' => CustomerController::class,
            '/meters' => MeterController::class,
            '/readings' => MeterReadingController::class,
            '/invoices' => InvoiceController::class,
            '/payments' => PaymentController::class,
            // '/areas' => AreaController::class, // Commented out - AreaController not implemented
            '/meter-logs' => MeterLogController::class,
            '/charges' => ChargeController::class,
        ]);
    });

    // Invoice payment route
    Route::post('/payments/invoice', [PaymentController::class, 'storeInvoicePayment'])->name('payments.invoice');

    // Custom customer routes
    Route::get('/customers/export', [CustomerController::class, 'exportAll'])->name('customers.export-all');
    Route::get('/customers/{customer}/export-bills', [CustomerController::class, 'exportBills'])->name('customers.export-bills');
    Route::get('/customers/{customer}/export-readings', [CustomerController::class, 'exportReadings'])->name('customers.export-readings');
    Route::get('/customers/{customer}/export', [CustomerController::class, 'exportCustomer'])->name('customers.export');

    // Additional MeterLog routes
    Route::get('/customers/{customer}/meter-logs', [MeterLogController::class, 'customerLogs'])->name('meter-logs.customer');
    Route::get('/meters/{meter}/logs', [MeterLogController::class, 'meterLogs'])->name('meter-logs.meter');
    
    // Additional MeterReading routes
    Route::post('/readings/generate-bills', [MeterReadingController::class, 'generateMissingBills'])->name('readings.generate-bills');
    Route::get('/readings/{reading}/bills', [MeterReadingController::class, 'readingBills'])->name('readings.bills');
    Route::get('/readings/test-bill-generation', [MeterReadingController::class, 'testBillGeneration'])->name('readings.test-bill-generation');
    Route::get('/readings/test-create-reading-bill', [MeterReadingController::class, 'testCreateReadingAndBill'])->name('readings.test-create-reading-bill');
    Route::post('/readings/test-create-bill', [MeterReadingController::class, 'testCreateBill'])->name('readings.test-create-bill');

    // Inventory Management
    Route::resources([
        '/inventory' => InventoryController::class,
        '/inventory/transactions' => InventoryTransactionController::class,
        '/suppliers' => SupplierController::class,
        '/purchase-orders' => PurchaseOrderController::class,
    ]);

    // Fleet & Maintenance
    Route::resources([
        '/vehicles' => VehicleController::class,
        '/maintenance' => MaintenanceRequestController::class,
    ]);

    // User Management
    Route::resources([
        '/users' => UserController::class,
        '/departments' => DepartmentController::class,
        // '/roles' => RoleController::class, // Commented out - RoleController not implemented
    ]);

    // User export routes
    Route::get('/users/{user}/export-readings', [UserController::class, 'exportReadings'])->name('users.export-readings');
    Route::get('/users/{user}/export-bills', [UserController::class, 'exportBills'])->name('users.export-bills');

    // Legacy routes (keeping for compatibility) - Apply department restrictions
    Route::middleware(['department.restriction'])->group(function () {
        Route::resources([
            '/categories' => CategoryController::class,
            // 'types' => TypeController::class, // Commented out - TypeController not implemented
        ]);
    });
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
