<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\Supplier;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $purchaseOrders = PurchaseOrder::with(['supplier'])
            ->latest()
            ->paginate(10);

        return Inertia::render('purchase-orders/index', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $suppliers = Supplier::all();

        return Inertia::render('purchase-orders/create', [
            'suppliers' => $suppliers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'status' => 'required|in:pending,received,cancelled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        PurchaseOrder::create($validated);

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'items.item']);

        return Inertia::render('purchase-orders/show', [
            'purchaseOrder' => $purchaseOrder
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseOrder $purchaseOrder)
    {
        $suppliers = Supplier::all();

        return Inertia::render('purchase-orders/edit', [
            'purchaseOrder' => $purchaseOrder,
            'suppliers' => $suppliers
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'status' => 'required|in:pending,received,cancelled',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $purchaseOrder->update($validated);

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        // Check if purchase order has items
        if ($purchaseOrder->items()->count() > 0) {
            return redirect()->route('purchase-orders.index')->with('error', 'Cannot delete purchase order with existing items.');
        }

        $purchaseOrder->delete();

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase order deleted successfully.');
    }

    /**
     * Get pending purchase orders.
     */
    public function pending()
    {
        $purchaseOrders = PurchaseOrder::where('status', 'pending')
            ->with(['supplier'])
            ->latest()
            ->paginate(10);

        return Inertia::render('purchase-orders/pending', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Get received purchase orders.
     */
    public function received()
    {
        $purchaseOrders = PurchaseOrder::where('status', 'received')
            ->with(['supplier'])
            ->latest()
            ->paginate(10);

        return Inertia::render('purchase-orders/received', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Get cancelled purchase orders.
     */
    public function cancelled()
    {
        $purchaseOrders = PurchaseOrder::where('status', 'cancelled')
            ->with(['supplier'])
            ->latest()
            ->paginate(10);

        return Inertia::render('purchase-orders/cancelled', [
            'purchaseOrders' => $purchaseOrders
        ]);
    }

    /**
     * Update status of purchase order.
     */
    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,received,cancelled',
        ]);

        $purchaseOrder->update($validated);

        return redirect()->route('purchase-orders.show', $purchaseOrder)->with('success', 'Status updated successfully.');
    }
}
