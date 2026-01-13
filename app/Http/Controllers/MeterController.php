<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MeterController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Meter::with('home.customer')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('meter_number', 'like', "%{$search}%")
                  ->orWhereHas('home.customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $meters = $query->paginate(10)->withQueryString();
        $homes = \App\Models\Home::with('customer')->get();

        $stats = [
            'total' => \App\Models\Meter::count(),
            'active' => \App\Models\Meter::where('status', 'active')->count(),
            'inactive' => \App\Models\Meter::where('status', 'inactive')->count(),
            'maintenance' => \App\Models\Meter::where('status', 'maintenance')->count(),
            'damage' => \App\Models\Meter::where('status', 'damage')->count(),
        ];

        return Inertia::render('meters/index', [
            'meters' => $meters,
            'homes' => $homes,
            'filters' => $request->only(['search']),
            'stats' => $stats,
        ]);
    }

    public function export(Request $request)
    {
        $filename = 'meters-export-' . date('Y-m-d') . '.csv';

        $query = \App\Models\Meter::with('home.customer')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('meter_number', 'like', "%{$search}%")
                  ->orWhereHas('home.customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        $meters = $query->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Serial Number', 'Type', 'Status', 'Customer Name', 'Home Address'];

        $callback = function () use ($meters, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($meters as $meter) {
                $row = [
                    $meter->id,
                    $meter->meter_number,
                    $meter->meter_type,
                    $meter->status,
                    $meter->home?->customer?->name ?? 'N/A',
                    $meter->home?->address ?? 'N/A',
                ];
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'meter_number' => 'required|unique:meters',
            'meter_type' => 'required|string',
            'home_id' => 'nullable|exists:homes,id',
            'installation_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,maintenance,damage',
        ]);

        $validated['home_id'] = $validated['home_id'] ?? null;
        $validated['installation_date'] = $validated['installation_date'] ?? null;

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request) {
            // Unassign old meter if exists
            if (!empty($validated['home_id'])) {
                $oldMeter = \App\Models\Meter::where('home_id', $validated['home_id'])->first();
                if ($oldMeter) {
                    $lastReading = \App\Models\MeterReading::where('meter_id', $oldMeter->id)
                        ->latest('reading_date')
                        ->first();

                    \App\Models\MeterHistory::create([
                        'home_id' => $oldMeter->home_id,
                        'meter_id' => $oldMeter->id,
                        'customer_id' => $oldMeter->home ? $oldMeter->home->customer_id : null,
                        'final_reading' => $lastReading ? $lastReading->current_reading : 0,
                        'assigned_at' => $oldMeter->installation_date,
                        'unassigned_at' => now(),
                        'replaced_by' => auth()->id(),
                        'reason' => 'replacement',
                    ]);

                    $oldMeter->update([
                        'home_id' => null,
                        'status' => 'inactive'
                    ]);
                }
            }

            $meter = \App\Models\Meter::create($validated);

            if ($request->filled('initial_reading') && $validated['home_id']) {
                \App\Models\MeterReading::create([
                    'meter_id' => $meter->id,
                    'home_id' => $validated['home_id'],
                    'reading_date' => now(),
                    'current_reading' => $request->initial_reading,
                    'previous_reading' => 0,
                    'read_by' => auth()->id(),
                ]);
            }
        });

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $meter = \App\Models\Meter::findOrFail($id);

        $validated = $request->validate([
            'home_id' => 'sometimes|nullable|exists:homes,id',
            'initial_reading' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,maintenance,damage',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request, $meter) {
            
            // Handle Assignment
            if ($request->has('home_id')) {
                 if ($validated['home_id']) {
                    $oldMeter = \App\Models\Meter::where('home_id', $validated['home_id'])
                        ->where('id', '!=', $meter->id)
                        ->first();
                    
                    if ($oldMeter) {
                        $lastReading = \App\Models\MeterReading::where('meter_id', $oldMeter->id)
                            ->latest('reading_date')
                            ->first();

                        \App\Models\MeterHistory::create([
                            'home_id' => $oldMeter->home_id,
                            'meter_id' => $oldMeter->id,
                            'customer_id' => $oldMeter->home ? $oldMeter->home->customer_id : null,
                            'final_reading' => $lastReading ? $lastReading->current_reading : 0,
                            'assigned_at' => $oldMeter->installation_date,
                            'unassigned_at' => now(),
                            'replaced_by' => auth()->id(),
                            'reason' => 'replacement',
                        ]);

                        $oldMeter->update([
                            'home_id' => null,
                            'status' => 'inactive',
                        ]);
                    }
                }
                
                $meter->update([
                    'home_id' => $validated['home_id'],
                    'status' => 'active', // Default to active on assignment
                    'installation_date' => now(),
                ]);

                 if ($request->filled('initial_reading') && $validated['home_id']) {
                    \App\Models\MeterReading::create([
                        'meter_id' => $meter->id,
                        'home_id' => $validated['home_id'],
                        'reading_date' => now(),
                        'current_reading' => $request->initial_reading,
                        'previous_reading' => 0,
                        'read_by' => auth()->id(),
                    ]);
                }
            }

            // Handle Status Update Only
            if ($request->has('status')) {
                $meter->update(['status' => $validated['status']]);
            }
        });

        return redirect()->back()->with('success', 'Meter updated successfully.');
    }

    public function show($id)
    {
        $meter = \App\Models\Meter::with('home.customer')->findOrFail($id);
        return Inertia::render('meters/show', [
            'meter' => $meter
        ]);
    }

    public function destroy($id)
    {
        $meter = \App\Models\Meter::findOrFail($id);
        $meter->delete();

        return redirect()->back()->with('success', 'Meter deleted successfully.');
    }
}
