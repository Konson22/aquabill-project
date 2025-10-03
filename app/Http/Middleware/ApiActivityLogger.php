<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ApiActivityLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Log the incoming request
        $this->logRequest($request);
        
        // Process the request
        $response = $next($request);
        
        // Calculate execution time
        $executionTime = round((microtime(true) - $startTime) * 1000, 2);
        
        // Log the response
        $this->logResponse($request, $response, $executionTime);
        
        return $response;
    }

    /**
     * Log the incoming API request
     */
    private function logRequest(Request $request): void
    {
        $logData = [
            'type' => 'api_request',
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
            'user_email' => Auth::user()?->email,
            'timestamp' => now()->toISOString(),
            'headers' => $this->getFilteredHeaders($request),
            'query_params' => $request->query(),
            'request_size' => strlen($request->getContent()),
        ];

        // Add request body for non-GET requests (excluding sensitive data)
        if ($request->method() !== 'GET') {
            $logData['request_body'] = $this->getFilteredRequestBody($request);
        }

        Log::channel('api')->info('API Request', $logData);
    }

    /**
     * Log the API response
     */
    private function logResponse(Request $request, Response $response, float $executionTime): void
    {
        $logData = [
            'type' => 'api_response',
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'ip' => $request->ip(),
            'user_id' => Auth::id(),
            'user_email' => Auth::user()?->email,
            'timestamp' => now()->toISOString(),
            'execution_time_ms' => $executionTime,
            'response_size' => strlen($response->getContent()),
        ];

        // Add response body for error responses or if it's small enough
        if ($response->getStatusCode() >= 400 || strlen($response->getContent()) < 1000) {
            $logData['response_body'] = $this->getFilteredResponseBody($response);
        }

        // Determine log level based on status code
        $logLevel = $this->getLogLevel($response->getStatusCode());
        
        Log::channel('api')->{$logLevel}('API Response', $logData);
    }

    /**
     * Get filtered headers (remove sensitive information)
     */
    private function getFilteredHeaders(Request $request): array
    {
        $sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
        $headers = $request->headers->all();
        
        foreach ($sensitiveHeaders as $sensitive) {
            if (isset($headers[$sensitive])) {
                $headers[$sensitive] = ['***REDACTED***'];
            }
        }
        
        return $headers;
    }

    /**
     * Get filtered request body (remove sensitive information)
     */
    private function getFilteredRequestBody(Request $request): array
    {
        $sensitiveFields = ['password', 'password_confirmation', 'current_password', 'new_password', 'token', 'api_key'];
        $body = $request->all();
        
        foreach ($sensitiveFields as $field) {
            if (isset($body[$field])) {
                $body[$field] = '***REDACTED***';
            }
        }
        
        return $body;
    }

    /**
     * Get filtered response body (remove sensitive information)
     */
    private function getFilteredResponseBody(Response $response): array
    {
        $content = $response->getContent();
        
        // Try to decode JSON response
        $decoded = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $sensitiveFields = ['token', 'api_key', 'password', 'access_token', 'refresh_token'];
            
            foreach ($sensitiveFields as $field) {
                if (isset($decoded[$field])) {
                    $decoded[$field] = '***REDACTED***';
                }
                
                // Check nested data structure
                if (isset($decoded['data']) && is_array($decoded['data'])) {
                    foreach ($sensitiveFields as $field) {
                        if (isset($decoded['data'][$field])) {
                            $decoded['data'][$field] = '***REDACTED***';
                        }
                    }
                }
            }
            
            return $decoded;
        }
        
        // Return as string if not JSON
        return ['content' => $content];
    }

    /**
     * Determine log level based on HTTP status code
     */
    private function getLogLevel(int $statusCode): string
    {
        if ($statusCode >= 500) {
            return 'error';
        } elseif ($statusCode >= 400) {
            return 'warning';
        } elseif ($statusCode >= 300) {
            return 'info';
        } else {
            return 'info';
        }
    }
}
