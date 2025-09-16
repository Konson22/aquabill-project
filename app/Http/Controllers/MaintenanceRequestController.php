<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MaintenanceRequest;
use App\Models\InventoryItem;
use App\Models\Vehicle;
use App\Models\User;

class MaintenanceRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $maintenanceRequests = MaintenanceRequest::with(['item', 'vehicle', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('maintenance-requests/index', [
            'maintenanceRequests' => $maintenanceRequests
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $inventoryItems = InventoryItem::all();
        $vehicles = Vehicle::all();
        $users = User::all();

        return Inertia::render('maintenance-requests/create', [
            'inventoryItems' => $inventoryItems,
            'vehicles' => $vehicles,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'nullable|exists:inventory_items,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'description' => 'required|string|max:255',
            'request_date' => 'required|date',
            'status' => 'required|in:pending,in_progress,completed',
            'handled_by' => 'nullable|exists:users,id',
        ]);

        // Ensure either item_id or vehicle_id is provided
        if (empty($validated['item_id']) && empty($validated['vehicle_id'])) {
            return back()->withErrors(['item_id' => 'Either an inventory item or vehicle must be selected.']);
        }

        MaintenanceRequest::create($validated);

        return redirect()->route('maintenance-requests.index')->with('success', 'Maintenance request created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MaintenanceRequest $maintenanceRequest)
    {
        $maintenanceRequest->load(['item', 'vehicle', 'handledBy']);

        return Inertia::render('maintenance-requests/show', [
            'maintenanceRequest' => $maintenanceRequest
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MaintenanceRequest $maintenanceRequest)
    {
        $inventoryItems = InventoryItem::all();
        $vehicles = Vehicle::all();
        $users = User::all();

        return Inertia::render('maintenance-requests/edit', [
            'maintenanceRequest' => $maintenanceRequest,
            'inventoryItems' => $inventoryItems,
            'vehicles' => $vehicles,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MaintenanceRequest $maintenanceRequest)
    {
        $validated = $request->validate([
            'item_id' => 'nullable|exists:inventory_items,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'description' => 'required|string|max:255',
            'request_date' => 'required|date',
            'status' => 'required|in:pending,in_progress,completed',
            'handled_by' => 'nullable|exists:users,id',
        ]);

        // Ensure either item_id or vehicle_id is provided
        if (empty($validated['item_id']) && empty($validated['vehicle_id'])) {
            return back()->withErrors(['item_id' => 'Either an inventory item or vehicle must be selected.']);
        }

        $maintenanceRequest->update($validated);

        return redirect()->route('maintenance-requests.index')->with('success', 'Maintenance request updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MaintenanceRequest $maintenanceRequest)
    {
        $maintenanceRequest->delete();

        return redirect()->route('maintenance-requests.index')->with('success', 'Maintenance request deleted successfully.');
    }

    /**
     * Get pending maintenance requests.
     */
    public function pending()
    {
        $maintenanceRequests = MaintenanceRequest::where('status', 'pending')
            ->with(['item', 'vehicle', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('maintenance-requests/pending', [
            'maintenanceRequests' => $maintenanceRequests
        ]);
    }

    /**
     * Get in-progress maintenance requests.
     */
    public function inProgress()
    {
        $maintenanceRequests = MaintenanceRequest::where('status', 'in_progress')
            ->with(['item', 'vehicle', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('maintenance-requests/in-progress', [
            'maintenanceRequests' => $maintenanceRequests
        ]);
    }

    /**
     * Get completed maintenance requests.
     */
    public function completed()
    {
        $maintenanceRequests = MaintenanceRequest::where('status', 'completed')
            ->with(['item', 'vehicle', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('maintenance-requests/completed', [
            'maintenanceRequests' => $maintenanceRequests
        ]);
    }

    /**
     * Update status of maintenance request.
     */
    public function updateStatus(Request $request, MaintenanceRequest $maintenanceRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
            'handled_by' => 'required|exists:users,id',
        ]);

        $maintenanceRequest->update($validated);

        return redirect()->route('maintenance-requests.show', $maintenanceRequest)->with('success', 'Status updated successfully.');
    }
}
