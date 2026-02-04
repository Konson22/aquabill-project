<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ZonesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $zones = Zone::query()
            ->with('areas')
            ->withCount(['areas'])
            ->withCount([
                'homes as customers_count' => function ($query) {
                    $query->select(DB::raw('count(distinct customer_id)'));
                },
            ])
            ->latest()
            ->get();

        $zones->makeHidden(['created_at', 'updated_at']);

        return response()->json($zones);
    }

   
}
