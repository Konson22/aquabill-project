<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $customers = \App\Models\Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->withCount('homes')
            ->latest()
            ->paginate(10);

        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'plot_number' => 'nullable|string|max:50',
            'zone_id' => 'nullable|exists:zones,id',
            'area_id' => 'nullable|exists:areas,id',
            'tariff_id' => 'nullable|exists:tariffs,id',
            'meter_id' => 'nullable|exists:meters,id',
            'installation_fee' => 'nullable|numeric|min:0',
        ]);

        $customer = \App\Models\Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
        ]);

        if (!empty($validated['address']) || !empty($validated['plot_number'])) {
            $home = $customer->homes()->create([
                'address' => $validated['address'],
                'plot_number' => $validated['plot_number'],
                'zone_id' => $validated['zone_id'],
                'area_id' => $validated['area_id'],
                'tariff_id' => $validated['tariff_id'],
            ]);

            if (!empty($validated['meter_id'])) {
                $meter = \App\Models\Meter::find($validated['meter_id']);
                if ($meter) {
                    $meter->update([
                        'home_id' => $home->id,
                        'status' => 'active',
                    ]);
                    $home->update([
                        'meter_install_date' => now()
                    ]);
                }
            }
        }

        return response()->json($customer->load('homes.meter'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = \App\Models\Customer::with('homes.meter')->findOrFail($id);
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $customer = \App\Models\Customer::findOrFail($id);
        $customer->update($validated);

        return response()->json($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = \App\Models\Customer::findOrFail($id);
        $customer->delete();

        return response()->json(null, 204);
    }
}
