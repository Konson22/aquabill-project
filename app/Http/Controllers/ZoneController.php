<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    public function index(): Response
    {
        $zones = Zone::withCount('customers')->get();

        return Inertia::render('zones/index', [
            'zones' => $zones,
        ]);
    }
}
