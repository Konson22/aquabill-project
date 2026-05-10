<?php

namespace App\Http\Controllers\Api\Gis;

use App\Http\Controllers\Controller;
use App\Models\WaterPointType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WaterPointTypeController extends Controller
{
    public function index(Request $request): JsonResponse
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

        return response()->json($query->paginate((int) $request->get('per_page', 15)));
    }

    public function store(Request $request): JsonResponse
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

        $type = WaterPointType::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json($type, 201);
    }

    public function show(WaterPointType $waterPointType): JsonResponse
    {
        $waterPointType->loadCount('waterPoints');

        return response()->json($waterPointType);
    }

    public function update(Request $request, WaterPointType $waterPointType): JsonResponse
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

        return response()->json($waterPointType);
    }

    public function destroy(WaterPointType $waterPointType): JsonResponse
    {
        if ($waterPointType->waterPoints()->exists()) {
            return response()->json(['message' => 'Cannot delete type with water points.'], 422);
        }

        $waterPointType->delete();

        return response()->json(null, 204);
    }
}
