<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Rules\GeoJsonPolygonBoundary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    public function index(): Response
    {
        $zones = Zone::query()
            ->with(['supplyDay'])
            ->withCount('customers')
            ->get();

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
            'supply_day_id' => ['nullable', Rule::exists('supply_days', 'id')->where('status', 'active')],
            'supply_time' => 'nullable|string',
            'description' => 'nullable|string',
            'boundary_geojson' => ['nullable', 'array', new GeoJsonPolygonBoundary],
            'status' => 'required|in:active,inactive',
        ]);

        Zone::create($validated);

        return back()->with('success', 'Zone created successfully.');
    }

    /**
     * Update only the GeoJSON polygon boundary for a zone (GIS workflow).
     */
    public function updateBoundary(Request $request, Zone $zone): RedirectResponse
    {
        $validated = $request->validate([
            'boundary_geojson' => ['nullable', 'array', new GeoJsonPolygonBoundary],
        ]);

        $zone->update([
            'boundary_geojson' => $validated['boundary_geojson'],
        ]);

        return back()->with('success', 'Zone boundary updated.');
    }
}
