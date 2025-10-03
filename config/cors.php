<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Allow all origins - useful for development and mobile apps
        '*',
    ],

    'allowed_origins_patterns' => [
        // Allow all HTTP/HTTPS origins
        '/^https?:\/\/.*$/',
        // Allow all localhost variations
        '/^https?:\/\/localhost(:[0-9]+)?$/',
        '/^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/',
        // Allow all IP addresses
        '/^https?:\/\/\d+\.\d+\.\d+\.\d+(:[0-9]+)?$/',
        // Mobile app domains
        '/^capacitor:\/\/.*$/',
        '/^ionic:\/\/.*$/',
        // Expo development patterns
        '/^exp:\/\/.*$/',
    ],

    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'X-API-Key',
        'X-Device-ID',
        'X-App-Version',
        'X-Platform',
        'User-Agent',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
    ],

    'exposed_headers' => [
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => false, // Set to false for mobile apps

];

