<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $department = $request->user()->department?->name ?? 'none';

        return match ($department) {
            'admin' => redirect()->route('admin'),
            'finance' => redirect()->route('finance'),
            'ledger' => redirect()->route('ledger'),
            'hr' => redirect()->route('hr'),
            'customer_care' => redirect()->route('customer-care'),
            'distribution' => Inertia::render('distribution/dashboard'),
            default => Inertia::render('dashboard'),
        };
    }
}
