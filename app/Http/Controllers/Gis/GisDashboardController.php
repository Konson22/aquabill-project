<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class GisDashboardController extends Controller
{
    /**
     * GIS landing page with links to the map and GIS CRUD sections.
     */
    public function index(): Response
    {
        return Inertia::render('gis/dashboard');
    }
}
