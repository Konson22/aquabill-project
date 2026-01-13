<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class MeterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meters = \App\Models\Meter::with('home.customer')->paginate(10);
        return response()->json($meters);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Implement store logic if needed
        return response()->json(['message' => 'Not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $meter = \App\Models\Meter::with('home.customer', 'readings')->findOrFail($id);
        return response()->json($meter);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
         // Implement update logic if needed
         return response()->json(['message' => 'Not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Implement destroy logic if needed
         return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
