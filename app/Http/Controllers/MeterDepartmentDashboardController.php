<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class MeterDepartmentDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('meters-readers/dashboard/index');
    }
}
