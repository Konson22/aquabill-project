<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Models\Pipe;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PipeController extends Controller
{
    public function index(Request $request): Response
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

        return Inertia::render('gis/pipes/index', [
            'pipes' => $query->paginate(15)->withQueryString(),
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                'search' => $request->input('search'),
                'pipe_type' => $request->input('pipe_type'),
                'zone_id' => $request->input('zone_id'),
                'status' => $request->input('status'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('gis/pipes/create', [
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
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

        Pipe::create($validated);

        return redirect()->route('gis.pipes.index')->with('success', 'Pipe created.');
    }

    public function show(Pipe $pipe): Response
    {
        $pipe->load(['zone:id,name', 'valves:id,valve_code,pipe_id']);

        return Inertia::render('gis/pipes/show', [
            'pipe' => $pipe,
        ]);
    }

    public function edit(Pipe $pipe): Response
    {
        return Inertia::render('gis/pipes/edit', [
            'pipe' => $pipe,
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Pipe $pipe): RedirectResponse
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

        return redirect()->route('gis.pipes.show', $pipe)->with('success', 'Pipe updated.');
    }

    public function destroy(Pipe $pipe): RedirectResponse
    {
        $pipe->delete();

        return redirect()->route('gis.pipes.index')->with('success', 'Pipe deleted.');
    }
}
