<?php

namespace App\Http\Controllers\Api\Gis;

use App\Http\Controllers\Controller;
use App\Models\WaterPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WaterPointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sort = in_array($request->get('sort'), ['code', 'name', 'status', 'created_at'], true)
            ? $request->get('sort')
            : 'code';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $query = WaterPoint::query()
            ->with(['zone:id,name', 'waterPointType:id,name,slug'])
            ->search($request->input('search'))
            ->when($request->filled('water_point_type_id'), fn ($q) => $q->where('water_point_type_id', (int) $request->input('water_point_type_id')))
            ->when($request->filled('zone_id'), fn ($q) => $q->where('zone_id', (int) $request->input('zone_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')))
            ->orderBy($sort, $direction);

        return response()->json($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:water_points,code',
            'meter_no' => 'nullable|string|max:255|unique:water_points,meter_no',
            'name' => 'required|string|max:255',
            'water_point_type_id' => 'required|exists:water_point_types,id',
            'zone_id' => 'nullable|exists:zones,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'manager_name' => 'nullable|string|max:255',
            'manager_phone' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,maintenance,damaged',
            'description' => 'nullable|string',
        ]);

        $point = WaterPoint::create($validated);
        $point->load(['zone:id,name', 'waterPointType:id,name']);

        return response()->json($point, 201);
    }

    public function show(WaterPoint $waterPoint): JsonResponse
    {
        $waterPoint->load(['zone:id,name', 'waterPointType:id,name,slug']);

        return response()->json($waterPoint);
    }

    public function update(Request $request, WaterPoint $waterPoint): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:water_points,code,'.$waterPoint->id,
            'meter_no' => 'nullable|string|max:255|unique:water_points,meter_no,'.$waterPoint->id,
            'name' => 'required|string|max:255',
            'water_point_type_id' => 'required|exists:water_point_types,id',
            'zone_id' => 'nullable|exists:zones,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'manager_name' => 'nullable|string|max:255',
            'manager_phone' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,maintenance,damaged',
            'description' => 'nullable|string',
        ]);

        $waterPoint->update($validated);
        $waterPoint->load(['zone:id,name', 'waterPointType:id,name']);

        return response()->json($waterPoint);
    }

    public function destroy(WaterPoint $waterPoint): JsonResponse
    {
        $waterPoint->delete();

        return response()->json(null, 204);
    }
}
