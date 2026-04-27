<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HRController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('hr/dashboard');
    }
}
