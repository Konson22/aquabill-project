<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Models\Pipe;
use App\Models\Valve;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ValveController extends Controller
{
    public function index(Request $request): Response
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

        return Inertia::render('gis/valves/index', [
            'valves' => $query->paginate(15)->withQueryString(),
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'pipes' => Pipe::query()->orderBy('pipe_code')->get(['id', 'pipe_code']),
            'filters' => [
                'search' => $request->input('search'),
                'valve_type' => $request->input('valve_type'),
                'zone_id' => $request->input('zone_id'),
                'pipe_id' => $request->input('pipe_id'),
                'status' => $request->input('status'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('gis/valves/create', [
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'pipes' => Pipe::query()->orderBy('pipe_code')->get(['id', 'pipe_code']),
        ]);
    }

    public function store(Request $request): RedirectResponse
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

        Valve::create($validated);

        return redirect()->route('gis.valves.index')->with('success', 'Valve created.');
    }

    public function show(Valve $valve): Response
    {
        $valve->load(['zone:id,name', 'pipe:id,pipe_code,pipe_type']);

        return Inertia::render('gis/valves/show', [
            'valve' => $valve,
        ]);
    }

    public function edit(Valve $valve): Response
    {
        return Inertia::render('gis/valves/edit', [
            'valve' => $valve,
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'pipes' => Pipe::query()->orderBy('pipe_code')->get(['id', 'pipe_code']),
        ]);
    }

    public function update(Request $request, Valve $valve): RedirectResponse
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

        return redirect()->route('gis.valves.show', $valve)->with('success', 'Valve updated.');
    }

    public function destroy(Valve $valve): RedirectResponse
    {
        $valve->delete();

        return redirect()->route('gis.valves.index')->with('success', 'Valve deleted.');
    }
}
