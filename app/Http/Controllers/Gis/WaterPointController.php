<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Models\WaterPoint;
use App\Models\WaterPointType;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaterPointController extends Controller
{
    public function index(Request $request): Response
    {
        $sort = in_array($request->get('sort'), ['code', 'name', 'status', 'created_at'], true)
            ? $request->get('sort')
            : 'code';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $query = WaterPoint::query()
            ->with(['zone:id,name', 'waterPointType:id,name'])
            ->search($request->input('search'))
            ->when($request->filled('water_point_type_id'), fn ($q) => $q->where('water_point_type_id', (int) $request->input('water_point_type_id')))
            ->when($request->filled('zone_id'), fn ($q) => $q->where('zone_id', (int) $request->input('zone_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')))
            ->orderBy($sort, $direction);

        return Inertia::render('gis/water-points/index', [
            'waterPoints' => $query->paginate(15)->withQueryString(),
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'waterPointTypes' => WaterPointType::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->input('search'),
                'water_point_type_id' => $request->input('water_point_type_id'),
                'zone_id' => $request->input('zone_id'),
                'status' => $request->input('status'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('gis/water-points/create', [
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'waterPointTypes' => WaterPointType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
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

        WaterPoint::create($validated);

        return redirect()->route('gis.water-points.index')->with('success', 'Water point created.');
    }

    public function show(WaterPoint $waterPoint): Response
    {
        $waterPoint->load(['zone:id,name', 'waterPointType:id,name,slug']);

        return Inertia::render('gis/water-points/show', [
            'waterPoint' => $waterPoint,
        ]);
    }

    public function edit(WaterPoint $waterPoint): Response
    {
        return Inertia::render('gis/water-points/edit', [
            'waterPoint' => $waterPoint,
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'waterPointTypes' => WaterPointType::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, WaterPoint $waterPoint): RedirectResponse
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

        return redirect()->route('gis.water-points.show', $waterPoint)->with('success', 'Water point updated.');
    }

    public function destroy(WaterPoint $waterPoint): RedirectResponse
    {
        $waterPoint->delete();

        return redirect()->route('gis.water-points.index')->with('success', 'Water point deleted.');
    }
}
