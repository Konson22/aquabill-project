<?php

namespace App\Http\Controllers;

use App\Models\SupplyDay;
use App\Models\SupplyHistory;
use App\Models\SupplySchedule;
use App\Models\Zone;
use App\Rules\GeoJsonPolygonBoundary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    public function index(): Response
    {
        $zones = Zone::query()
            ->with([
                'supplySchedules' => fn ($query) => $query->active()->with('supplyDay'),
            ])
            ->withCount(['customers', 'supplyHistories'])
            ->orderBy('name')
            ->get();

        $waterSupplySchedules = SupplySchedule::query()
            ->active()
            ->with(['zone:id,name,status', 'supplyDay:id,name,is_reserve,sort_order'])
            ->get()
            ->sortBy([
                fn (SupplySchedule $schedule): string => $schedule->zone?->name ?? '',
                fn (SupplySchedule $schedule): int => $schedule->supplyDay?->sort_order ?? 0,
            ])
            ->values();

        $supplyHistories = SupplyHistory::query()
            ->with([
                'zone:id,name',
                'supplyDay:id,name,is_reserve',
                'recordedBy:id,name',
            ])
            ->orderByDesc('supplied_on')
            ->orderByDesc('id')
            ->limit(100)
            ->get();

        $reserveDays = SupplyDay::query()
            ->reserve()
            ->orderBy('sort_order')
            ->get(['id', 'name']);

        return Inertia::render('zones/index', [
            'zones' => $zones,
            'waterSupplySchedules' => $waterSupplySchedules,
            'supplyHistories' => $supplyHistories,
            'reserveDays' => $reserveDays,
        ]);
    }

    /**
     * Store a newly created zone.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:zones,name',
            'description' => 'nullable|string',
            'boundary_geojson' => ['nullable', 'array', new GeoJsonPolygonBoundary],
            'status' => 'required|in:active,inactive',
        ]);

        Zone::query()->create($validated);

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
