<?php

namespace App\Http\Controllers\Api\Gis;

use App\Http\Controllers\Controller;
use App\Models\Valve;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sort = in_array($request->get('sort'), ['valve_code', 'valve_type', 'status', 'created_at'], true)
            ? $request->get('sort')
            : 'valve_code';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $query = Valve::query()
            ->with(['zone:id,name', 'pipe:id,pipe_code'])
            ->search($request->input('search'))
            ->when($request->filled('valve_type'), fn ($q) => $q->where('valve_type', (string) $request->input('valve_type')))
            ->when($request->filled('zone_id'), fn ($q) => $q->where('zone_id', (int) $request->input('zone_id')))
            ->when($request->filled('pipe_id'), fn ($q) => $q->where('pipe_id', (int) $request->input('pipe_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')))
            ->orderBy($sort, $direction);

        return response()->json($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'valve_code' => 'required|string|max:255|unique:valves,valve_code',
            'zone_id' => 'nullable|exists:zones,id',
            'pipe_id' => 'nullable|exists:pipes,id',
            'valve_type' => 'required|in:main,control,isolation,washout,air_release',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'required|in:open,closed,damaged,maintenance',
            'installation_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $valve = Valve::create($validated);
        $valve->load(['zone:id,name', 'pipe:id,pipe_code']);

        return response()->json($valve, 201);
    }

    public function show(Valve $valve): JsonResponse
    {
        $valve->load(['zone:id,name', 'pipe:id,pipe_code,pipe_type']);

        return response()->json($valve);
    }

    public function update(Request $request, Valve $valve): JsonResponse
    {
        $validated = $request->validate([
            'valve_code' => 'required|string|max:255|unique:valves,valve_code,'.$valve->id,
            'zone_id' => 'nullable|exists:zones,id',
            'pipe_id' => 'nullable|exists:pipes,id',
            'valve_type' => 'required|in:main,control,isolation,washout,air_release',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'status' => 'required|in:open,closed,damaged,maintenance',
            'installation_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $valve->update($validated);
        $valve->load(['zone:id,name', 'pipe:id,pipe_code']);

        return response()->json($valve);
    }

    public function destroy(Valve $valve): JsonResponse
    {
        $valve->delete();

        return response()->json(null, 204);
    }
}
