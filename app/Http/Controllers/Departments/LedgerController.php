<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ledger/dashboard');
    }
}
