<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentationController extends Controller
{
    /**
     * Display the documentation and support page.
     */
    public function index()
    {
        return Inertia::render('documentation/index');
    }
}
