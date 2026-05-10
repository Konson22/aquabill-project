<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Support\GisMapQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GisMapController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = GisMapQuery::filtersFromRequest($request);
        $mapData = GisMapQuery::mapData($filters);

        return Inertia::render('gis/map', [
            'mapData' => [
                'water_points' => $mapData['water_points'],
                'pipes' => $mapData['pipes'],
                'valves' => $mapData['valves'],
                'customers' => $mapData['customers'],
            ],
        ]);
    }
}
