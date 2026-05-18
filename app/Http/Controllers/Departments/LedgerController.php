<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Services\LedgerDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function index(LedgerDashboardService $ledgerDashboard): Response
    {
        return Inertia::render('ledger/dashboard', $ledgerDashboard->build());
    }
}
