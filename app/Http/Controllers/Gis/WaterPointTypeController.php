<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Models\WaterPointType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class WaterPointTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $sort = in_array($request->get('sort'), ['name', 'slug', 'created_at'], true)
            ? $request->get('sort')
            : 'name';
        $direction = $request->get('direction') === 'desc' ? 'desc' : 'asc';

        $query = WaterPointType::query()
            ->withCount('waterPoints')
            ->when($request->filled('search'), function ($q) use ($request): void {
                $term = (string) $request->input('search');
                $q->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('slug', 'like', "%{$term}%");
                });
            })
            ->orderBy($sort, $direction);

        return Inertia::render('gis/water-point-types/index', [
            'types' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $request->input('search'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('gis/water-point-types/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:water_point_types,name',
            'description' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['name']);
        $base = $slug;
        $i = 1;
        while (WaterPointType::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        WaterPointType::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('gis.water-point-types.index')->with('success', 'Water point type created.');
    }

    public function show(WaterPointType $waterPointType): Response
    {
        $waterPointType->loadCount('waterPoints');

        return Inertia::render('gis/water-point-types/show', [
            'type' => $waterPointType,
        ]);
    }

    public function edit(WaterPointType $waterPointType): Response
    {
        return Inertia::render('gis/water-point-types/edit', [
            'type' => $waterPointType,
        ]);
    }

    public function update(Request $request, WaterPointType $waterPointType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:water_point_types,name,'.$waterPointType->id,
            'description' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['name']);
        $base = $slug;
        $i = 1;
        while (WaterPointType::query()->where('slug', $slug)->where('id', '!=', $waterPointType->id)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        $waterPointType->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('gis.water-point-types.show', $waterPointType)->with('success', 'Water point type updated.');
    }

    public function destroy(WaterPointType $waterPointType): RedirectResponse
    {
        if ($waterPointType->waterPoints()->exists()) {
            return back()->with('error', 'Cannot delete a type that still has water points.');
        }

        $waterPointType->delete();

        return redirect()->route('gis.water-point-types.index')->with('success', 'Water point type deleted.');
    }
}
