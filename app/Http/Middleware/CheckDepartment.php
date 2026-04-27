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
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $department): Response
    {
        if ($request->user() && $request->user()->department?->name === $department) {
            return $next($request);
        }

        abort(403, 'Unauthorized access to this department dashboard.');
    }
}
