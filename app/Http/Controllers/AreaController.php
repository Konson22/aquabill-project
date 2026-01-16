<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:areas,code',
            'zone_id' => 'required|exists:zones,id',
            'description' => 'nullable|string',
        ]);

        \App\Models\Area::create($validated);

        return redirect()->back()->with('success', 'Area created successfully.');
    }
    public function update(Request $request, $id)
    {
        $area = \App\Models\Area::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:areas,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $area->update($validated);

        return redirect()->back()->with('success', 'Area updated successfully.');
    }

    public function destroy($id)
    {
        $area = \App\Models\Area::findOrFail($id);
        
        $area->delete();

        return redirect()->back()->with('success', 'Area deleted successfully.');
    }
}
