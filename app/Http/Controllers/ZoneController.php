<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Zone::withCount(['areas', 'homes']);

        // Single query for all stats (avoids 3 separate counts + duplicate zones count)
        $statsRow = DB::selectOne("
            SELECT
                (SELECT COUNT(*) FROM zones) as zones_count,
                (SELECT COUNT(*) FROM areas) as areas_count,
                (SELECT COUNT(*) FROM customers) as customers_count
        ");
        $stats = [
            'zones_count' => (int) $statsRow->zones_count,
            'areas_count' => (int) $statsRow->areas_count,
            'customers_count' => (int) $statsRow->customers_count,
        ];

        $perPage = 10;
        $page = (int) $request->input('page', 1);
        $total = $stats['zones_count'];
        $zones = $query->forPage($page, $perPage)->get();
        $zones = new \Illuminate\Pagination\LengthAwarePaginator(
            $zones,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('zones/index', [
            'zones' => $zones,
            'stats' => $stats,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        \App\Models\Zone::create($validated);

        return redirect()->back()->with('success', 'Zone created successfully.');
    }

    public function show($id)
    {
        $zone = \App\Models\Zone::with(['areas' => function($query) {
            $query->withCount('homes');
        }])->withCount(['areas', 'homes'])->findOrFail($id);
        
        return Inertia::render('zones/show', [
            'zone' => $zone,
            'all_zones' => \App\Models\Zone::all()
        ]);
    }

    public function update(Request $request, $id)
    {
        $zone = \App\Models\Zone::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $zone->update($validated);

        return redirect()->back()->with('success', 'Zone updated successfully.');
    }

    public function destroy($id)
    {
        $zone = \App\Models\Zone::findOrFail($id);
        
        if ($zone->areas()->exists()) {
             return redirect()->back()->withErrors(['error' => 'Cannot delete zone with associated areas.']);
        }

        $zone->delete();

        return redirect()->back()->with('success', 'Zone deleted successfully.');
    }
}
