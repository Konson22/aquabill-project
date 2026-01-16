<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MeterDepartmentDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard-meter-department/index');
    }
}
