<?php

namespace App\Http\Controllers\Gis;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use Inertia\Inertia;
use Inertia\Response;

class GisZoneBoundaryController extends Controller
{
    /**
     * GIS page: draw or edit billing zone polygons (GeoJSON), saved to the selected zone.
     */
    public function __invoke(): Response
    {
        $zones = Zone::query()
            ->orderBy('name')
            ->get(['id', 'name', 'boundary_geojson']);

        return Inertia::render('gis/zone-boundaries', [
            'zones' => $zones,
        ]);
    }
}
