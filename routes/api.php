<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\Gis\MapDataController as GisMapDataController;
use App\Http\Controllers\Api\Gis\PipeController as ApiGisPipeController;
use App\Http\Controllers\Api\Gis\ValveController as ApiGisValveController;
use App\Http\Controllers\Api\Gis\WaterPointController as ApiGisWaterPointController;
use App\Http\Controllers\Api\Gis\WaterPointTypeController as ApiGisWaterPointTypeController;
use App\Http\Controllers\Api\ReadingController;
use App\Models\ServiceChargeType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test', [CustomerController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->name('api.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('user');

    Route::apiResource('customers', CustomerController::class)->only(['index']);
    Route::post('customers/coordinates', [CustomerController::class, 'updateCoordinates'])
        ->name('customers.coordinates.update');
    Route::get('/service-charge-types', function () {
        return ServiceChargeType::all();
    });
    Route::apiResource('readings', ReadingController::class)->only(['index', 'store']);
    Route::apiResource('bills', BillController::class)->only(['index', 'show']);

    Route::prefix('gis')->name('gis.')->group(function () {
        Route::get('map-data', GisMapDataController::class)->name('map-data');
        Route::apiResource('water-point-types', ApiGisWaterPointTypeController::class);
        Route::apiResource('water-points', ApiGisWaterPointController::class);
        Route::apiResource('pipes', ApiGisPipeController::class);
        Route::apiResource('valves', ApiGisValveController::class);
    });
});
