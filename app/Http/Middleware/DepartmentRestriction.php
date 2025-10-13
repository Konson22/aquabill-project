<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DepartmentRestriction
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $restriction = null): Response
    {
        $user = $request->user();
        
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect()->route('login');
        }

        $userDepartment = $user->department ? $user->department->name : null;

        // Billing department: can only access customers, meters, and readings
        if ($userDepartment === 'Billing') {
            $allowedRoutes = ['customers', 'meters', 'readings'];
            $currentRoute = $request->route()->getName();
            
            // Block access to finance routes
            if (str_contains($currentRoute, 'finance')) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have permission to access the Finance section.'], 403);
                }
                return redirect()->route('dashboard')->with('error', 'You do not have permission to access the Finance section.');
            }
            
            // Block access to categories/tariffs routes
            if (str_contains($currentRoute, 'categories') || str_contains($currentRoute, 'tariffs')) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have permission to access the Categories & Tariffs section.'], 403);
                }
                return redirect()->route('dashboard')->with('error', 'You do not have permission to access the Categories & Tariffs section.');
            }
            
            // Block access to invoices routes
            if (str_contains($currentRoute, 'invoices')) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have permission to access the Invoices section.'], 403);
                }
                return redirect()->route('dashboard')->with('error', 'You do not have permission to access the Invoices section.');
            }
            
            // Block access to payments routes
            if (str_contains($currentRoute, 'payments')) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have permission to access the Payments section.'], 403);
                }
                return redirect()->route('dashboard')->with('error', 'You do not have permission to access the Payments section.');
            }
            
            // Check if the current route is allowed for billing department
            $isAllowed = false;
            foreach ($allowedRoutes as $allowedRoute) {
                if (str_contains($currentRoute, $allowedRoute)) {
                    $isAllowed = true;
                    break;
                }
            }
            
            if (!$isAllowed) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You can only access customers, meters, and readings.'], 403);
                }
                return redirect()->route('dashboard')->with('error', 'You can only access customers, meters, and readings.');
            }
        }

        // Finance department: can access everything but cannot edit customer info or readings
        if ($userDepartment === 'Finance') {
            $currentRoute = $request->route()->getName();
            $method = $request->method();
            
            // Block edit operations for customers and readings (but allow DELETE for customers)
            if (str_contains($currentRoute, 'customers') && in_array($method, ['PUT', 'PATCH'])) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You cannot edit customer information.'], 403);
                }
                return redirect()->back()->with('error', 'You cannot edit customer information.');
            }
            
            if (str_contains($currentRoute, 'readings') && in_array($method, ['PUT', 'PATCH', 'DELETE'])) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You cannot edit meter readings.'], 403);
                }
                return redirect()->back()->with('error', 'You cannot edit meter readings.');
            }
        }

        // Administration department: has full access to user management
        if ($userDepartment === 'Administration') {
            // Administration department has full access to all features including user management
            return $next($request);
        }

        // For all other departments, restrict user management access
        if ($userDepartment !== 'Administration' && $userDepartment !== 'Finance') {
            $currentRoute = $request->route()->getName();
            $method = $request->method();
            
            // Block access to user management for non-admin departments
            if (str_contains($currentRoute, 'users') && in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                if ($request->expectsJson()) {
                    return response()->json(['error' => 'You do not have permission to manage users. Only Administration department can manage users.'], 403);
                }
                return redirect()->back()->with('error', 'You do not have permission to manage users. Only Administration department can manage users.');
            }
        }

        return $next($request);
    }
}
