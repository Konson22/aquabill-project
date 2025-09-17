<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DepartmentAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $department = null): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // If no department is specified, allow access
        if (!$department) {
            return $next($request);
        }

        // Check if user belongs to the specified department
        if ($user->department && $user->department->name === $department) {
            return $next($request);
        }

        // If user doesn't belong to the required department, deny access
        return redirect()->route('dashboard')->with('error', 'You do not have permission to access this resource.');
    }
}
