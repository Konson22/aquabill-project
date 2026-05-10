<?php

namespace App\Http\Controllers\Api\Gis;

use App\Http\Controllers\Controller;
use App\Models\Pipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sort = in_array($request->get('sort'), ['pipe_code', 'pipe_type', 'status', 'created_at'], true)
            ? $request->get('sort')
            : 'pipe_code';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $query = Pipe::query()
            ->with('zone:id,name')
            ->search($request->input('search'))
            ->when($request->filled('pipe_type'), fn ($q) => $q->where('pipe_type', (string) $request->input('pipe_type')))
            ->when($request->filled('zone_id'), fn ($q) => $q->where('zone_id', (int) $request->input('zone_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')))
            ->orderBy($sort, $direction);

        return response()->json($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pipe_code' => 'required|string|max:255|unique:pipes,pipe_code',
            'zone_id' => 'nullable|exists:zones,id',
            'pipe_type' => 'required|in:main,distribution,service',
            'material' => 'nullable|string|max:255',
            'diameter' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'coordinates' => 'nullable|array|min:2',
            'coordinates.*' => 'array|size:2',
            'coordinates.*.0' => 'required_with:coordinates|numeric|between:-90,90',
            'coordinates.*.1' => 'required_with:coordinates|numeric|between:-180,180',
            'status' => 'required|in:active,inactive,damaged,maintenance',
            'installation_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $pipe = Pipe::create($validated);
        $pipe->load('zone:id,name');

        return response()->json($pipe, 201);
    }

    public function show(Pipe $pipe): JsonResponse
    {
        $pipe->load(['zone:id,name', 'valves:id,valve_code,pipe_id']);

        return response()->json($pipe);
    }

    public function update(Request $request, Pipe $pipe): JsonResponse
    {
        $validated = $request->validate([
            'pipe_code' => 'required|string|max:255|unique:pipes,pipe_code,'.$pipe->id,
            'zone_id' => 'nullable|exists:zones,id',
            'pipe_type' => 'required|in:main,distribution,service',
            'material' => 'nullable|string|max:255',
            'diameter' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'coordinates' => 'nullable|array|min:2',
            'coordinates.*' => 'array|size:2',
            'coordinates.*.0' => 'required_with:coordinates|numeric|between:-90,90',
            'coordinates.*.1' => 'required_with:coordinates|numeric|between:-180,180',
            'status' => 'required|in:active,inactive,damaged,maintenance',
            'installation_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $pipe->update($validated);
        $pipe->load('zone:id,name');

        return response()->json($pipe);
    }

    public function destroy(Pipe $pipe): JsonResponse
    {
        $pipe->delete();

        return response()->json(null, 204);
    }
}
