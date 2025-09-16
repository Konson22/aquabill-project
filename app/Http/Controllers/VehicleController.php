<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vehicle;
use App\Models\User;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $vehicles = Vehicle::with(['assignedTo'])
            ->latest()
            ->paginate(10);

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all();

        return Inertia::render('vehicles/create', [
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|max:255|unique:vehicles',
            'type' => 'required|string|max:255',
            'status' => 'required|in:available,in_use,maintenance',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        Vehicle::create($validated);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['assignedTo', 'maintenanceRequests']);

        return Inertia::render('vehicles/show', [
            'vehicle' => $vehicle
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vehicle $vehicle)
    {
        $users = User::all();

        return Inertia::render('vehicles/edit', [
            'vehicle' => $vehicle,
            'users' => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|max:255|unique:vehicles,plate_number,' . $vehicle->id,
            'type' => 'required|string|max:255',
            'status' => 'required|in:available,in_use,maintenance',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $vehicle->update($validated);

        return redirect()->route('vehicles.index')->with('success', 'Vehicle updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle)
    {
        // Check if vehicle has maintenance requests
        if ($vehicle->maintenanceRequests()->count() > 0) {
            return redirect()->route('vehicles.index')->with('error', 'Cannot delete vehicle with existing maintenance requests.');
        }

        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('success', 'Vehicle deleted successfully.');
    }

    /**
     * Get available vehicles.
     */
    public function available()
    {
        $vehicles = Vehicle::where('status', 'available')
            ->with(['assignedTo'])
            ->latest()
            ->paginate(10);

        return Inertia::render('vehicles/available', [
            'vehicles' => $vehicles
        ]);
    }

    /**
     * Get vehicles in maintenance.
     */
    public function inMaintenance()
    {
        $vehicles = Vehicle::where('status', 'maintenance')
            ->with(['assignedTo'])
            ->latest()
            ->paginate(10);

        return Inertia::render('vehicles/in-maintenance', [
            'vehicles' => $vehicles
        ]);
    }

    /**
     * Assign vehicle to user.
     */
    public function assign(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $vehicle->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'in_use'
        ]);

        return redirect()->route('vehicles.show', $vehicle)->with('success', 'Vehicle assigned successfully.');
    }

    /**
     * Unassign vehicle.
     */
    public function unassign(Vehicle $vehicle)
    {
        $vehicle->update([
            'assigned_to' => null,
            'status' => 'available'
        ]);

        return redirect()->route('vehicles.show', $vehicle)->with('success', 'Vehicle unassigned successfully.');
    }
}
