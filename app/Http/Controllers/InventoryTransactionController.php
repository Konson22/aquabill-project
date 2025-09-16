<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\InventoryTransaction;
use App\Models\InventoryItem;
use App\Models\User;

class InventoryTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $transactions = InventoryTransaction::with(['item', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-transactions/index', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $inventoryItems = InventoryItem::all();
        $users = User::all();

        return Inertia::render('inventory-transactions/create', [
            'inventoryItems' => $inventoryItems,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'handled_by' => 'required|exists:users,id',
        ]);

        // Update inventory item quantity
        $item = InventoryItem::find($validated['item_id']);
        if ($validated['type'] === 'IN') {
            $item->increment('quantity_available', $validated['quantity']);
        } else {
            if ($item->quantity_available < $validated['quantity']) {
                return back()->withErrors(['quantity' => 'Insufficient stock available.']);
            }
            $item->decrement('quantity_available', $validated['quantity']);
        }

        InventoryTransaction::create($validated);

        return redirect()->route('inventory-transactions.index')->with('success', 'Transaction recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(InventoryTransaction $transaction)
    {
        $transaction->load(['item', 'handledBy']);

        return Inertia::render('inventory-transactions/show', [
            'transaction' => $transaction
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(InventoryTransaction $transaction)
    {
        $inventoryItems = InventoryItem::all();
        $users = User::all();

        return Inertia::render('inventory-transactions/edit', [
            'transaction' => $transaction,
            'inventoryItems' => $inventoryItems,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, InventoryTransaction $transaction)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer|min:1',
            'transaction_date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'handled_by' => 'required|exists:users,id',
        ]);

        // Revert the old transaction
        $oldItem = InventoryItem::find($transaction->item_id);
        if ($transaction->type === 'IN') {
            $oldItem->decrement('quantity_available', $transaction->quantity);
        } else {
            $oldItem->increment('quantity_available', $transaction->quantity);
        }

        // Apply the new transaction
        $newItem = InventoryItem::find($validated['item_id']);
        if ($validated['type'] === 'IN') {
            $newItem->increment('quantity_available', $validated['quantity']);
        } else {
            if ($newItem->quantity_available < $validated['quantity']) {
                return back()->withErrors(['quantity' => 'Insufficient stock available.']);
            }
            $newItem->decrement('quantity_available', $validated['quantity']);
        }

        $transaction->update($validated);

        return redirect()->route('inventory-transactions.index')->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryTransaction $transaction)
    {
        // Revert the transaction
        $item = InventoryItem::find($transaction->item_id);
        if ($transaction->type === 'IN') {
            $item->decrement('quantity_available', $transaction->quantity);
        } else {
            $item->increment('quantity_available', $transaction->quantity);
        }

        $transaction->delete();

        return redirect()->route('inventory-transactions.index')->with('success', 'Transaction deleted successfully.');
    }

    /**
     * Get incoming transactions.
     */
    public function incoming()
    {
        $transactions = InventoryTransaction::where('type', 'IN')
            ->with(['item', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-transactions/incoming', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Get outgoing transactions.
     */
    public function outgoing()
    {
        $transactions = InventoryTransaction::where('type', 'OUT')
            ->with(['item', 'handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-transactions/outgoing', [
            'transactions' => $transactions
        ]);
    }

    /**
     * Get transactions for a specific item.
     */
    public function itemTransactions(InventoryItem $item)
    {
        $transactions = InventoryTransaction::where('item_id', $item->id)
            ->with(['handledBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory-transactions/item-transactions', [
            'item' => $item,
            'transactions' => $transactions
        ]);
    }
}
