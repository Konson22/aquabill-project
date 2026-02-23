<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Zone;
use App\Models\Area;
use App\Models\Tariff;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * "Homes" list and CRUD – now backed by Customer (one customer = one connection).
 */
class HomeController extends Controller
{
    public function search(Request $request)
    {
        $search = $request->query('query');

        if (!$search) {
            return response()->json([]);
        }

        $customers = Customer::query()
            ->with(['meter:id,meter_number'])
            ->where(function ($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                    ->orWhere('plot_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhereHas('meter', function ($q) use ($search) {
                        $q->where('meter_number', 'like', "%{$search}%");
                    });
            })
            ->limit(10)
            ->get(['id', 'name', 'address', 'plot_number']);

        $results = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'label' => ($customer->address ?? $customer->name) . ' - ' . $customer->name,
                'value' => $customer->id,
                'customer_name' => $customer->name,
                'plot_number' => $customer->plot_number,
                'meter_number' => $customer->meter?->meter_number ?? null,
            ];
        });

        return response()->json($results);
    }

    public function index(Request $request)
    {
        $homes = Customer::query()
            ->with(['meter', 'zone', 'area', 'tariff', 'latestReading'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                        ->orWhere('plot_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhereHas('meter', function ($q) use ($search) {
                            $q->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, fn ($q, $v) => $q->where('zone_id', $v))
            ->when($request->area_id, fn ($q, $v) => $q->where('area_id', $v))
            ->when($request->tariff_id, fn ($q, $v) => $q->where('tariff_id', $v))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('homes/index', [
            'homes' => $homes,
            'filters' => $request->only(['search', 'zone_id', 'area_id', 'tariff_id']),
            'zones' => Zone::select('id', 'name')->get(),
            'areas' => Area::select('id', 'name')->get(),
            'tariffs' => Tariff::select('id', 'name')->get(),
            'summary' => [
                'total_homes' => Customer::count(),
                'with_meters' => Customer::has('meter')->count(),
                'with_customers' => Customer::count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $homes = Customer::query()
            ->with(['meter', 'zone', 'area', 'tariff', 'latestReading'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('address', 'like', "%{$search}%")
                        ->orWhere('plot_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhereHas('meter', function ($q) use ($search) {
                            $q->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, fn ($q, $v) => $q->where('zone_id', $v))
            ->when($request->area_id, fn ($q, $v) => $q->where('area_id', $v))
            ->when($request->tariff_id, fn ($q, $v) => $q->where('tariff_id', $v))
            ->latest()
            ->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=homes-export-" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = ['ID', 'Address', 'Plot Number', 'Customer', 'Zone', 'Area', 'Tariff', 'Meter Number'];

        $callback = function () use ($homes, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($homes as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->address ?? '',
                    $row->plot_number ?? '',
                    $row->name,
                    $row->zone?->name ?? 'N/A',
                    $row->area?->name ?? 'N/A',
                    $row->tariff?->name ?? 'N/A',
                    $row->meter?->meter_number ?? 'N/A',
                ]);
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

        $customer = Customer::findOrFail($validated['customer_id']);
        $customer->update([
            'address' => $validated['address'],
            'plot_number' => $validated['plot_number'],
            'zone_id' => $validated['zone_id'],
            'area_id' => $validated['area_id'],
            'tariff_id' => $validated['tariff_id'],
        ]);

        return redirect()->back()->with('success', 'Connection updated successfully.');
    }

    public function show(Customer $home)
    {
        return redirect()->route('customers.home', $home->id);
    }

    public function edit(Customer $home)
    {
        return Inertia::render('homes/edit', [
            'home' => $home->load(['zone', 'area', 'tariff']),
            'customers' => Customer::select('id', 'name')->get(),
            'zones' => Zone::select('id', 'name')->get(),
            'areas' => Area::select('id', 'name')->get(),
            'tariffs' => Tariff::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Customer $home)
    {
        $validated = $request->validate([
            'address' => 'required|string|max:255',
            'plot_number' => 'required|string|max:50',
            'zone_id' => 'required|exists:zones,id',
            'area_id' => 'required|exists:areas,id',
            'tariff_id' => 'required|exists:tariffs,id',
        ]);

        $home->update($validated);

        return redirect()->route('homes.index')->with('success', 'Connection updated successfully.');
    }

    public function destroy(Customer $home)
    {
        $home->delete();

        return redirect()->back()->with('success', 'Connection deleted successfully.');
    }
}
