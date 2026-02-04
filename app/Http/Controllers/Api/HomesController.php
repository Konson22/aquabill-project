<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Home;
use Illuminate\Support\Facades\Log;

class HomesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $homes = Home::query()
                ->has('meter')
                ->with([
                    'customer',
                    'meter',
                    'zone',
                    'area',
                    'tariff',
                    'latestReading',
                ])
                ->latest()
                ->get()
                ->map(function ($data) {
                    return [
                        'home_id' => $data->id,
                        'address' => $data->address,
                        'plot_number' => $data->plot_number,
                        'customer_name' => $data->customer->name ?? 'N/A',
                        'meter' => $data->meter ? [
                            'id' => $data->meter->id,
                            'meter_number' => $data->meter->meter_number,
                            'type' => $data->meter->type,
                            'status' => $data->meter->status,
                        ] : null,
                        'zone' => $data->zone->name,
                        'area' => $data->area->name,
                        'tariff' => [
                            'name' => $data->tariff->name ?? 'N/A',
                            'price' => $data->tariff->price ?? 0,
                            'fixed_charge' => $data->tariff->fixed_charge ?? 0,
                        ],
                        'latest_reading' => [
                            'current_reading' => $data->latestReading->current_reading ?? 0,
                            'reading_date' => $data->latestReading->reading_date ?? 'N/A',
                        ],
                    ];
                });
        } catch (\Throwable $e) {
            Log::error('Failed to load homes', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to load homes.',
            ], 500);
        }

        return response()->json($homes);
    }

    /**
     * Store a newly created resource in storage.
     */
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

        $home = Home::create($validated);

        return response()->json($home->load(['customer', 'zone', 'area', 'tariff', 'latestReading']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $home = Home::with(['customer', 'meter', 'zone', 'area', 'tariff', 'latestReading'])->findOrFail($id);
        return response()->json($home);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'address' => 'sometimes|string|max:255',
            'plot_number' => 'sometimes|string|max:50',
            'customer_id' => 'sometimes|exists:customers,id',
            'zone_id' => 'sometimes|exists:zones,id',
            'area_id' => 'sometimes|exists:areas,id',
            'tariff_id' => 'sometimes|exists:tariffs,id',
        ]);

        $home = Home::findOrFail($id);
        $home->update($validated);

        return response()->json($home->load(['customer', 'zone', 'area', 'tariff', 'latestReading']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $home = Home::findOrFail($id);
        $home->delete();

        return response()->json(null, 204);
    }
}
