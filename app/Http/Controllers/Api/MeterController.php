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
    public function show($id)
    {
        $meter = \App\Models\Meter::with(['home.customer', 'home.tariff', 'readings' => function($q) {
            $q->latest()->limit(5);
        }])->findOrFail($id);
        
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
   
}
