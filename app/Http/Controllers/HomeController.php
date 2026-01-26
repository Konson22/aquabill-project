<?php

namespace App\Http\Controllers;

use App\Models\Home;
use App\Models\Zone;
use App\Models\Area;
use App\Models\Tariff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function search(Request $request)
    {
        $search = $request->query('query');

        if (!$search) {
            return response()->json([]);
        }

        $homes = Home::query()
            ->with(['customer:id,name', 'meter:id,meter_number']) // Optimized loading
            ->where(function($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                  ->orWhere('plot_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('meter', function ($q) use ($search) {
                      $q->where('meter_number', 'like', "%{$search}%");
                  });
            })
            ->limit(10)
            ->get(['id', 'address', 'plot_number', 'customer_id']);

        $results = $homes->map(function ($home) {
            return [
                'id' => $home->id,
                'label' => "{$home->address} - " . ($home->customer->name ?? 'No Customer'),
                'value' => $home->id,
                'customer_name' => $home->customer->name ?? null,
                'plot_number' => $home->plot_number,
                'meter_number' => $home->meter->meter_number ?? null,
            ];
        });

        return response()->json($results);
    }

    public function index(Request $request)
    {
        $homes = Home::query()
            ->with(['customer', 'meter', 'zone', 'area', 'tariff', 'latestReading'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                        ->orWhere('plot_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('meter', function ($q) use ($search) {
                            $q->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->when($request->area_id, function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->when($request->tariff_id, function ($query, $tariffId) {
                $query->where('tariff_id', $tariffId);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('homes/index', [
            'homes' => $homes,
            'filters' => $request->only(['search', 'zone_id', 'area_id', 'tariff_id']),
            'zones' => Zone::select('id', 'name')->get(),
            'areas' => Area::select('id', 'name')->get(), // Assuming Area model exists and has name
            'tariffs' => Tariff::select('id', 'name')->get(),
            'summary' => [
                'total_homes' => Home::count(),
                'with_meters' => Home::has('meter')->count(),
                'with_customers' => Home::has('customer')->count(),
            ],
        ]);
    }
    public function export(Request $request)
    {
        $filename = 'homes-export-' . date('Y-m-d') . '.csv';

        $homes = Home::query()
            ->with(['customer', 'meter', 'zone', 'area', 'tariff', 'latestReading'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                        ->orWhere('plot_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('meter', function ($q) use ($search) {
                            $q->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->when($request->area_id, function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->when($request->tariff_id, function ($query, $tariffId) {
                $query->where('tariff_id', $tariffId);
            })
            ->latest()
            ->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Address', 'Plot Number', 'Customer', 'Zone', 'Area', 'Tariff', 'Meter Number'];

        $callback = function () use ($homes, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($homes as $home) {
                $row = [
                    $home->id,
                    $home->address,
                    $home->plot_number,
                    $home->customer ? $home->customer->name : 'N/A',
                    $home->zone ? $home->zone->name : 'N/A',
                    $home->area ? $home->area->name : 'N/A',
                    $home->tariff ? $home->tariff->name : 'N/A',
                    $home->meter ? $home->meter->meter_number : 'N/A',
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
            'address' => 'required|string|max:255',
            'plot_number' => 'required|string|max:50',
            'customer_id' => 'required|exists:customers,id',
            'zone_id' => 'required|exists:zones,id',
            'area_id' => 'required|exists:areas,id',
            'tariff_id' => 'required|exists:tariffs,id',
        ]);

        Home::create($validated);

        return redirect()->back()->with('success', 'Home created successfully.');
    }

    public function show(Home $home)
    {
        return redirect()->route('customers.home', $home);
    }

    public function edit(Home $home)
    {
        return Inertia::render('homes/edit', [
            'home' => $home->load(['customer', 'zone', 'area', 'tariff']),
            'customers' => \App\Models\Customer::select('id', 'name')->get(),
            'zones' => Zone::select('id', 'name')->get(),
            'areas' => Area::select('id', 'name')->get(),
            'tariffs' => Tariff::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Home $home)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'plot_number' => 'required|string|max:50',
            'customer_id' => 'required|exists:customers,id',
            'zone_id' => 'required|exists:zones,id',
            'area_id' => 'required|exists:areas,id',
            'tariff_id' => 'required|exists:tariffs,id',
        ]);

        $home->update($validated);

        return redirect()->route('homes.index')->with('success', 'Home updated successfully.');
    }

    public function destroy(Home $home)
    {
        $home->delete();

        return redirect()->back()->with('success', 'Home deleted successfully.');
    }
}
