<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InventoryItem;

class InventoryController extends Controller
{
    /**
     * Display a listing of the inventory items.
     */
    public function index()
    {
        $inventoryItems = InventoryItem::withCount('transactions')
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory/index', [
            'inventoryItems' => $inventoryItems
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('inventory/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:255',
            'quantity_available' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        InventoryItem::create($validated);

        return redirect()->route('inventory.index')->with('success', 'Inventory item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryItem $inventoryItem)
    {
        $inventoryItem->load(['transactions' => function ($query) {
            $query->latest()->limit(10);
        }, 'purchaseOrderItems', 'maintenanceRequests']);

        return Inertia::render('inventory-items/show', [
            'inventoryItem' => $inventoryItem
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryItem $inventoryItem)
    {
        return Inertia::render('inventory-items/edit', [
            'inventoryItem' => $inventoryItem
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:255',
            'quantity_available' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
        ]);

        $inventoryItem->update($validated);

        return redirect()->route('inventory-items.index')->with('success', 'Inventory item updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryItem $inventoryItem)
    {
        // Check if item has transactions
        if ($inventoryItem->transactions()->count() > 0) {
            return redirect()->route('inventory-items.index')->with('error', 'Cannot delete item with existing transactions.');
        }

        $inventoryItem->delete();

        return redirect()->route('inventory-items.index')->with('success', 'Inventory item deleted successfully.');
    }

    /**
     * Get items that need reordering.
     */
    public function needsReorder()
    {
        $inventoryItems = InventoryItem::needsReorder()
            ->withCount('transactions')
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-items/needs-reorder', [
            'inventoryItems' => $inventoryItems
        ]);
    }

    /**
     * Get items with low stock.
     */
    public function lowStock()
    {
        $inventoryItems = InventoryItem::lowStock()
            ->withCount('transactions')
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-items/low-stock', [
            'inventoryItems' => $inventoryItems
        ]);
    }

    /**
     * Get items by category.
     */
    public function byCategory($category)
    {
        $inventoryItems = InventoryItem::inCategory($category)
            ->withCount('transactions')
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-items/by-category', [
            'inventoryItems' => $inventoryItems,
            'category' => $category
        ]);
    }
}


