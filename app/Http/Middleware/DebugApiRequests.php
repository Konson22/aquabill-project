<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class DebugApiRequests
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Detect if request is from mobile app
        $userAgent = $request->userAgent();
        $isMobileApp = $this->isMobileAppRequest($userAgent, $request);
        
        // Log all incoming API requests for debugging
        Log::info('API Request Debug', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $userAgent,
            'is_mobile_app' => $isMobileApp,
            'app_type' => $this->getAppType($userAgent),
            'headers' => $request->headers->all(),
            'content_type' => $request->header('Content-Type'),
            'origin' => $request->header('Origin'),
            'referer' => $request->header('Referer'),
            'authorization' => $request->header('Authorization') ? 'Present' : 'Missing',
            'timestamp' => now()->toISOString(),
        ]);

        $response = $next($request);

        // Log response details
        Log::info('API Response Debug', [
            'status_code' => $response->getStatusCode(),
            'content_type' => $response->headers->get('Content-Type'),
            'cors_headers' => [
                'Access-Control-Allow-Origin' => $response->headers->get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods' => $response->headers->get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers' => $response->headers->get('Access-Control-Allow-Headers'),
            ],
        ]);

        return $response;
    }

    /**
     * Detect if request is from mobile app
     */
    private function isMobileAppRequest($userAgent, Request $request): bool
    {
        // Check for Expo/React Native user agents
        if (str_contains($userAgent, 'okhttp') || 
            str_contains($userAgent, 'Expo') ||
            str_contains($userAgent, 'ReactNative') ||
            str_contains($userAgent, 'expo') ||
            str_contains($userAgent, 'react-native')) {
            return true;
        }

        // Check for mobile app specific headers
        if ($request->header('X-Platform') || 
            $request->header('X-App-Version') ||
            $request->header('X-Device-ID')) {
            return true;
        }

        // Check for Expo development URLs in origin
        $origin = $request->header('Origin');
        if ($origin && (str_starts_with($origin, 'exp://') || 
                       str_starts_with($origin, 'capacitor://') ||
                       str_starts_with($origin, 'ionic://'))) {
            return true;
        }

        return false;
    }

    /**
     * Get app type from user agent
     */
    private function getAppType($userAgent): string
    {
        if (str_contains($userAgent, 'okhttp')) {
            return 'Android App (okhttp)';
        }
        
        if (str_contains($userAgent, 'Expo') || str_contains($userAgent, 'expo')) {
            return 'Expo App';
        }
        
        if (str_contains($userAgent, 'ReactNative')) {
            return 'React Native App';
        }
        
        if (str_contains($userAgent, 'capacitor')) {
            return 'Capacitor App';
        }
        
        if (str_contains($userAgent, 'ionic')) {
            return 'Ionic App';
        }
        
        return 'Web Browser';
    }
}
