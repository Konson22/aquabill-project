<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use Illuminate\Http\Request;
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

    /**
     * Store a newly created zone.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:zones,name',
            'supply_day' => 'required|string',
            'supply_time' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        Zone::create($validated);

        return back()->with('success', 'Zone created successfully.');
    }
}
