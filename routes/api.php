<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController as ApiAuthController;
use App\Http\Controllers\Api\CustomerController as ApiCustomerController;
use App\Http\Controllers\Api\ReadingController as ApiReadingController;

// Test endpoint for debugging mobile app connectivity
Route::get('/test-connection', function () {
    return response()->json([
        'success' => true,
        'message' => 'API connection successful',
        'timestamp' => now()->toISOString(),
        'server_ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
        'origin' => request()->header('Origin'),
        'cors_headers' => [
            'Access-Control-Allow-Origin' => request()->header('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods' => request()->header('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers' => request()->header('Access-Control-Allow-Headers'),
        ],
        'environment' => app()->environment(),
        'app_url' => config('app.url'),
    ]);
});

// Simple ping endpoint for mobile apps
Route::get('/ping', function () {
    // Log the ping request
    \Log::info('Ping request received', [
        'ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
        'timestamp' => now()->toISOString(),
        'headers' => request()->headers->all(),
        'url' => request()->fullUrl(),
    ]);
    
    return response()->json([
        'status' => 'ok',
        'message' => 'Server is alive',
        'timestamp' => now()->toISOString(),
        'client_ip' => request()->ip(),
        'user_agent' => request()->userAgent(),
    ]);
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'uptime' => time() - $_SERVER['REQUEST_TIME'],
        'memory_usage' => memory_get_usage(true),
        'peak_memory' => memory_get_peak_usage(true),
    ]);
});

// Authentication
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/register', [ApiAuthController::class, 'register']);

Route::get('/test', [ApiCustomerController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Current user profile
    Route::get('/profile', [ApiAuthController::class, 'profile']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::post('/token/refresh', [ApiAuthController::class, 'refresh']);
    
    Route::get('/customers', [ApiCustomerController::class, 'index']);
    Route::post('/customers/{customer}/assign-meter', [ApiCustomerController::class, 'assignMeter']);
    Route::post('/readings', [ApiReadingController::class, 'store']);
});


