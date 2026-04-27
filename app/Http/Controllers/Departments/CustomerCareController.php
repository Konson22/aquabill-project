<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CustomerCareController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('customer-care/dashboard');
    }
}
