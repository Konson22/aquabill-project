<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\ServiceCharge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceChargeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $charges = ServiceCharge::with(['customer', 'serviceChargeType', 'issuer'])
            ->latest('issued_date')
            ->paginate(15);

        return Inertia::render('service-charges/index', [
            'charges' => $charges,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'service_charge_type_id' => 'required|exists:service_charge_types,id',
            'amount' => 'required|numeric|min:0.01',
            'issued_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $serviceCharge = ServiceCharge::create([
            'customer_id' => $customer->id,
            'service_charge_type_id' => $validated['service_charge_type_id'],
            'amount' => $validated['amount'],
            'issued_date' => $validated['issued_date'],
            'issued_by' => auth()->id(),
            'status' => 'unpaid',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Service charge created successfully',
            'charge' => $serviceCharge->load(['customer', 'serviceChargeType']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Confirm payment for the service charge.
     */
    public function confirmPayment(Request $request, string $id)
    {
        $charge = ServiceCharge::findOrFail($id);

        $charge->update([
            'status' => 'paid',
        ]);

        return back()->with('success', 'Service charge payment confirmed.');
    }
}
