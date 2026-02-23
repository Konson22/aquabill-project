<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MeterController extends Controller
{
    public function assign(\App\Models\Customer $home)
    {
        return Inertia::render('meters/assign', [
            'customer' => $home->load(['meter', 'zone', 'area']),
        ]);
    }

    public function index(Request $request)
    {
        $query = \App\Models\Meter::with(['customer', 'customer.tariff'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('meter_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }

        // Stats: single aggregated query (avoids 5 separate counts)
        $counts = \App\Models\Meter::selectRaw("
            COUNT(*) as total,
            SUM(status = 'active') as active,
            SUM(status = 'inactive') as inactive,
            SUM(status = 'maintenance') as maintenance,
            SUM(status = 'damage') as damage
        ")->first();

        $stats = [
            'total' => (int) $counts->total,
            'active' => (int) $counts->active,
            'inactive' => (int) $counts->inactive,
            'maintenance' => (int) $counts->maintenance,
            'damage' => (int) $counts->damage,
        ];

        $perPage = 25;
        $page = (int) $request->input('page', 1);
        $total = $request->filled('search') ? (clone $query)->count() : $stats['total'];
        $meters = $query->forPage($page, $perPage)->get();
        $meters = new \Illuminate\Pagination\LengthAwarePaginator(
            $meters,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        $customers = \App\Models\Customer::all();

        return Inertia::render('meters/index', [
            'meters' => $meters,
            'customers' => $customers,
            'filters' => $request->only(['search']),
            'stats' => $stats,
        ]);
    }

    public function search(Request $request)
    {
        $search = trim($request->get('q'));
        $query = \App\Models\Meter::whereNull('customer_id');

        if ($search !== '') {
            $query->where('meter_number', 'LIKE', "%{$search}%")
                ->limit(15);
        } else {
            // Return unassigned meters for dropdown scroll (no search filter)
            $query->orderBy('meter_number')->limit(50);
        }

        $meters = $query->get(['id', 'meter_number']);

        return response()->json($meters);
    }

    public function export(Request $request)
    {
        $filename = 'meters-export-' . date('Y-m-d') . '.csv';

        $query = \App\Models\Meter::with('customer')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('meter_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
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

        $columns = ['ID', 'Meter Number', 'Status', 'Customer Name', 'Address'];

        $callback = function () use ($meters, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($meters as $meter) {
                $row = [
                    $meter->id,
                    $meter->meter_number,
                    $meter->status,
                    $meter->customer?->name ?? 'N/A',
                    $meter->customer?->address ?? 'N/A',
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
            'customer_id' => 'nullable|exists:customers,id',
            'meter_install_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,maintenance,damage',
        ]);

        $validated['customer_id'] = $validated['customer_id'] ?? null;
        $meterInstallDate = $validated['meter_install_date'] ?? now();
        unset($validated['meter_install_date']);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request, $meterInstallDate) {
            if (!empty($validated['customer_id'])) {
                $oldMeter = \App\Models\Meter::where('customer_id', $validated['customer_id'])->first();
                if ($oldMeter) {
                    $lastReading = \App\Models\MeterReading::where('meter_id', $oldMeter->id)
                        ->latest('reading_date')
                        ->first();

                    \App\Models\MeterHistory::create([
                        'meter_id' => $oldMeter->id,
                        'customer_id' => $oldMeter->customer_id,
                        'final_reading' => $lastReading ? $lastReading->current_reading : 0,
                        'assigned_at' => $oldMeter->customer?->meter_install_date,
                        'unassigned_at' => now(),
                        'replaced_by' => auth()->id(),
                        'reason' => 'replacement',
                    ]);

                    $oldMeter->update([
                        'customer_id' => null,
                        'status' => 'inactive'
                    ]);
                }
            }

            $meter = \App\Models\Meter::create($validated);

            if (!empty($validated['customer_id'])) {
                \App\Models\Customer::where('id', $validated['customer_id'])->update([
                    'meter_install_date' => $meterInstallDate
                ]);
            }

            if ($request->filled('initial_reading') && $validated['customer_id']) {
                $initial = (float) $request->initial_reading;
                \App\Models\MeterReading::create([
                    'meter_id' => $meter->id,
                    'customer_id' => $validated['customer_id'],
                    'reading_date' => now(),
                    'previous_reading' => $initial,
                    'current_reading' => $initial,
                    'is_initial' => true,
                    'read_by' => auth()->id(),
                ]);
            }
        });

        if ($request->filled('customer_id')) {
            return redirect()->route('customers.show', $request->customer_id)->with('success', 'Meter created and assigned successfully.');
        }

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        $meter = \App\Models\Meter::findOrFail($id);

        $validated = $request->validate([
            'customer_id' => 'sometimes|nullable|exists:customers,id',
            'initial_reading' => 'nullable|numeric|min:0',
            'meter_install_date' => 'nullable|date',
            'status' => 'sometimes|in:active,inactive,maintenance,damage',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request, $meter) {

            if ($request->has('customer_id')) {
                if ($validated['customer_id']) {
                    $oldMeter = \App\Models\Meter::where('customer_id', $validated['customer_id'])
                        ->where('id', '!=', $meter->id)
                        ->first();

                    if ($oldMeter) {
                        $lastReading = \App\Models\MeterReading::where('meter_id', $oldMeter->id)
                            ->latest('reading_date')
                            ->first();

                        \App\Models\MeterHistory::create([
                            'meter_id' => $oldMeter->id,
                            'customer_id' => $oldMeter->customer_id,
                            'final_reading' => $lastReading ? $lastReading->current_reading : 0,
                            'assigned_at' => $oldMeter->customer?->meter_install_date,
                            'unassigned_at' => now(),
                            'replaced_by' => auth()->id(),
                            'reason' => 'replacement',
                        ]);

                        $oldMeter->update([
                            'customer_id' => null,
                            'status' => 'inactive',
                        ]);
                    }
                }

                $meter->update([
                    'customer_id' => $validated['customer_id'],
                    'status' => 'active',
                ]);

                if ($validated['customer_id']) {
                    \App\Models\Customer::where('id', $validated['customer_id'])->update([
                        'meter_install_date' => $validated['meter_install_date'] ?? now(),
                    ]);
                }

                if ($request->filled('initial_reading') && $validated['customer_id']) {
                    $initial = (float) $request->initial_reading;
                    \App\Models\MeterReading::create([
                        'meter_id' => $meter->id,
                        'customer_id' => $validated['customer_id'],
                        'reading_date' => now(),
                        'previous_reading' => $initial,
                        'current_reading' => $initial,
                        'is_initial' => true,
                        'read_by' => auth()->id(),
                    ]);
                }
            }

            if ($request->has('status')) {
                $meter->update(['status' => $validated['status']]);
            }
        });

        if ($request->filled('customer_id')) {
            return redirect()->route('customers.show', $request->customer_id)->with('success', 'Meter assigned successfully.');
        }

        return redirect()->back()->with('success', 'Meter updated successfully.');
    }

    public function show($id)
    {
        $meter = \App\Models\Meter::with('customer')->findOrFail($id);
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
