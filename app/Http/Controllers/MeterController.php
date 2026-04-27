<?php

namespace App\Http\Controllers;

use App\Models\Meter;
use Inertia\Inertia;
use Inertia\Response;

class MeterController extends Controller
{
    public function index(): Response
    {
        $meters = Meter::with(['customer'])
            ->latest()
            ->paginate(10);

        return Inertia::render('meters/index', [
            'meters' => $meters,
        ]);
    }
}
