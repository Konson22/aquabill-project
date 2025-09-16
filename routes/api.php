<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController as ApiAuthController;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Http\Controllers\Api\ReadingController as ApiReadingController;


// Authentication
Route::post('/login', [ApiAuthController::class, 'login']);

Route::get('/test', [ApiCustomerController::class, 'index']);

Route::get('/test', [ApiCustomerController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Current user profile
    Route::get('/profile', [ApiAuthController::class, 'profile']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::post('/token/refresh', [ApiAuthController::class, 'refresh']);
    
    // Customers resource
    Route::get('/customers', [ApiCustomerController::class, 'index']);
    Route::post('/customers', [ApiCustomerController::class, 'store']);

    // Meter readings resource
    Route::post('/readings', [ApiReadingController::class, 'store']);

});


