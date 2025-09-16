<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Meter;
use Carbon\Carbon;

class MeterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meters = Meter::with(['readings', 'customer'])->orderBy('created_at', 'desc')->get();

        $stats = [
            'total_meters' => Meter::count(),
            'active_meters' => Meter::where('status', 'active')->count(),
            'inactive_meters' => Meter::where('status', 'inactive')->count(),
            'faulty_meters' => Meter::where('status', 'faulty')->count(),
            'total_consumption' => Meter::with('readings')->get()->sum(function ($meter) {
                return $meter->readings->sum(function ($reading) {
                    return $reading->value - $reading->previous;
                });
            }),
        ];

        return Inertia::render('meters/index', compact('meters', 'stats'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('meters/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'serial' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:50',
            'manufactory' => 'nullable|string|max:50',
        ]);

        $meter = Meter::create([
            'serial' => $request->serial,
            'status' => $request->status,
            'size' => $request->size,
            'model' => $request->model,
            'manufactory' => $request->manufactory,
        ]);

        return redirect()->route('meters.index')
            ->with('success', 'Meter created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $meter = Meter::with([
            'readings',
            'customer'
        ])->findOrFail($id);
        
        // Order readings by date descending (latest first)
        $meter->readings = $meter->readings->sortByDesc('date');
        
        return Inertia::render('meters/show', compact('meter'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $meter = Meter::findOrFail($id);
        return Inertia::render('meters/edit', compact('meter'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $meter = Meter::findOrFail($id);

        $request->validate([
            'serial' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
            'size' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:50',
            'manufactory' => 'nullable|string|max:50',
        ]);

        $meter->update([
            'serial' => $request->serial,
            'status' => $request->status,
            'size' => $request->size,
            'model' => $request->model,
            'manufactory' => $request->manufactory,
        ]);

        return redirect()->route('meters.show', $meter->id)
            ->with('success', 'Meter updated successfully.');
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(string $id)
    {
        $meter = Meter::findOrFail($id);
        
        // Check if meter has readings before deleting
        if ($meter->readings()->count() > 0) {
            return back()->with('error', 'Cannot delete meter with existing readings. Please remove all readings first.');
        }
        
        $meter->delete();

        return redirect()->route('meters.index')
            ->with('success', 'Meter deleted successfully.');
    }
}
