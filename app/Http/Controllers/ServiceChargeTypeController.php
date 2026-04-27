<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ServiceChargeTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \Inertia\Inertia::render('admin/setting/service-charges', [
            'types' => \App\Models\ServiceChargeType::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:service_charge_types,name',
            'code' => 'required|string|unique:service_charge_types,code',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        \App\Models\ServiceChargeType::create($validated);

        return back()->with('success', 'Service charge type created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, \App\Models\ServiceChargeType $service_charge)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:service_charge_types,name,'.$service_charge->id,
            'code' => 'required|string|unique:service_charge_types,code,'.$service_charge->id,
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $service_charge->update($validated);

        return back()->with('success', 'Service charge type updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(\App\Models\ServiceChargeType $service_charge)
    {
        $service_charge->delete();

        return back()->with('success', 'Service charge type deleted successfully.');
    }
}
