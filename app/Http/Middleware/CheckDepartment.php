<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckDepartment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$departments): Response
    {
        if (! $request->user()) {
            abort(403, 'Unauthorized');
        }

        $userDepartment = $request->user()->department;

        // Admin can access all pages
        if ($userDepartment === 'admin') {
            return $next($request);
        }

        if (! in_array($userDepartment, $departments)) {
            abort(403, 'Access denied. You do not have permission to access this department.');
        }

        return $next($request);
    }
}

