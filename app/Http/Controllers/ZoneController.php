<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;

class ZoneController extends Controller
{
    public function index()
    {
        $zones = \App\Models\Zone::withCount(['areas', 'homes'])->paginate(10);
        
        $stats = [
            'zones_count' => \App\Models\Zone::count(),
            'areas_count' => \App\Models\Area::count(),
            'customers_count' => \App\Models\Customer::count(),
        ];

        return Inertia::render('zones/index', [
            'zones' => $zones,
            'stats' => $stats,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code',
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
            'zone' => $zone
        ]);
    }

    public function update(Request $request, $id)
    {
        $zone = \App\Models\Zone::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:zones,code,' . $id,
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
