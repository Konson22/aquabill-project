<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MeterController;
use App\Http\Controllers\Api\HomesController;
use App\Http\Controllers\Api\ReadingController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->name('api.')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('user');

    Route::apiResource('meters', MeterController::class);
    Route::apiResource('customers', HomesController::class);
    Route::apiResource('readings', ReadingController::class)->only(['store']);
});
Route::apiResource('test', HomesController::class);
