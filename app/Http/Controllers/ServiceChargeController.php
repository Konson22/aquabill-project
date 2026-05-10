<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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
     * Show the form for issuing a service charge for a customer (full page).
     */
    public function createForCustomer(Customer $customer): Response
    {
        return Inertia::render('customers/service-charges/create', [
            'customer' => $customer->only(['id', 'name', 'account_number', 'status']),
            'serviceChargeTypes' => ServiceChargeType::query()->orderBy('name')->get(['id', 'name', 'amount']),
        ]);
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

        if ($request->header('X-Inertia')) {
            return redirect()
                ->route('service-charges.index')
                ->with('success', 'Service charge created successfully.');
        }

        return response()->json([
            'message' => 'Service charge created successfully',
            'charge' => $serviceCharge->load(['customer', 'serviceChargeType']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceCharge $serviceCharge): Response
    {
        $serviceCharge->load([
            'customer.zone',
            'serviceChargeType',
            'issuer:id,name,email',
        ]);

        return Inertia::render('service-charges/show', [
            'charge' => $serviceCharge,
        ]);
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

        if ($charge->status === 'paid') {
            return back()->with('warning', 'This service charge is already marked as paid.');
        }

        DB::transaction(function () use ($charge, $request): void {
            $charge->update([
                'status' => 'paid',
            ]);

            $charge->payments()->create([
                'amount' => (float) $charge->amount,
                'current_balance' => 0.0,
                'payment_date' => now()->toDateString(),
                'payment_method' => $request->input('payment_method', 'cash'),
                'reference_number' => $request->input('reference_number'),
                'notes' => $request->input('notes'),
                'recorded_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Service charge payment confirmed.');
    }
}
