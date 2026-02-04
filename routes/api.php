<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MeterController;
use App\Http\Controllers\Api\HomesController;
use App\Http\Controllers\Api\ReadingController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ZonesController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/zones', [ZonesController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->name('api.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('user');

    Route::apiResource('customers', HomesController::class);
    Route::apiResource('readings', ReadingController::class)->only(['index', 'store']);
});
