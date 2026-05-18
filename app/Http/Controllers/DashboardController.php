<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    /**
     * Send the user to their department home. Access to URLs is still enforced by `department:{name}` middleware
     * and by permissions on roles; `users.department_id` chooses which dashboard branch to open first.
     */
    public function __invoke(Request $request): RedirectResponse|InertiaResponse
    {
        $department = $request->user()->department?->name ?? 'none';

        return match ($department) {
            'admin' => redirect()->route('admin'),
            'finance' => redirect()->route('finance'),
            'ledger' => redirect()->route('ledger'),
            'hr' => redirect()->route('hr'),
            'customer_care' => redirect()->route('customer-care'),
            'water_quality' => redirect()->route('water-quality'),
            'water_purification' => redirect()->route('water-purification'),
            'stores' => redirect()->route('stores'),
            'distribution' => Inertia::render('distribution/dashboard'),
            default => Inertia::render('dashboard'),
        };
    }
}
