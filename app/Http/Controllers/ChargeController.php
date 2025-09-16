<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;
use App\Models\Category;
use Inertia\Inertia;

class ChargeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $charges = Charge::with('category')->orderBy('created_at', 'desc')->get();

        return Inertia::render('charges/index', [
            'charges' => $charges,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all(['id', 'name']);
        
        return Inertia::render('charges/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'charge_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $charge = Charge::create([
            'charge_amount' => $request->charge_amount,
            'description' => $request->description,
            'category_id' => $request->category_id ?: null,
        ]);

        return redirect()->route('charges.index')
            ->with('success', 'Charge created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $charge = Charge::with('category')->findOrFail($id);

        return Inertia::render('charges/show', [
            'charge' => $charge,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $charge = Charge::findOrFail($id);
        $categories = Category::all(['id', 'name']);
        
        return Inertia::render('charges/edit', [
            'charge' => $charge,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'charge_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $charge = Charge::findOrFail($id);
        $charge->update([
            'charge_amount' => $request->charge_amount,
            'description' => $request->description,
            'category_id' => $request->category_id ?: null,
        ]);

        return redirect()->route('charges.index')
            ->with('success', 'Charge updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $charge = Charge::findOrFail($id);
        $charge->delete();

        return redirect()->route('charges.index')
            ->with('success', 'Charge deleted successfully.');
    }
}
