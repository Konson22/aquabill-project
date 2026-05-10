<?php

namespace App\Http\Controllers\Api\Gis;

use App\Http\Controllers\Controller;
use App\Support\GisMapQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MapDataController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $filters = GisMapQuery::filtersFromRequest($request);
        $mapData = GisMapQuery::mapData($filters);

        return response()->json([
            'filters' => $filters,
            'water_points' => $mapData['water_points'],
            'pipes' => $mapData['pipes'],
            'valves' => $mapData['valves'],
            'customers' => $mapData['customers'],
        ]);
    }
}
