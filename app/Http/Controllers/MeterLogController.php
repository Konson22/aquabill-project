<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MeterLog;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\User;

class MeterLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meterLogs = MeterLog::with(['customer', 'oldMeter', 'newMeter', 'performedBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('meter-logs/index', [
            'meterLogs' => $meterLogs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::active()->get();
        $meters = Meter::all();
        $users = User::all();

        return Inertia::render('meter-logs/create', [
            'customers' => $customers,
            'meters' => $meters,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'old_meter_id' => 'nullable|exists:meters,id',
            'new_meter_id' => 'nullable|exists:meters,id',
            'action_type' => 'required|in:initial_assignment,meter_replacement,meter_removal,meter_reactivation,meter_transfer,maintenance,upgrade,downgrade',
            'reason' => 'nullable|string',
            'effective_date' => 'required|date',
            'installation_date' => 'nullable|date',
            'old_meter_data' => 'nullable|array',
            'new_meter_data' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $validated['performed_by'] = auth()->id();

        // Create the meter log entry
        $meterLog = MeterLog::create($validated);

        // Handle meter assignment/reassignment based on action type
        switch ($validated['action_type']) {
            case 'initial_assignment':
                if ($validated['new_meter_id']) {
                    // Assign the meter to the customer by updating the customer record
                    Customer::where('id', $validated['customer_id'])->update([
                        'meter_id' => $validated['new_meter_id']
                    ]);
                }
                break;

            case 'meter_replacement':
                if ($validated['old_meter_id']) {
                    // Remove the old meter from the customer
                    Customer::where('meter_id', $validated['old_meter_id'])->update([
                        'meter_id' => null
                    ]);
                }
                if ($validated['new_meter_id']) {
                    // Assign the new meter to the customer
                    Customer::where('id', $validated['customer_id'])->update([
                        'meter_id' => $validated['new_meter_id']
                    ]);
                }
                break;

            case 'meter_removal':
                if ($validated['old_meter_id']) {
                    // Remove the meter from the customer
                    Customer::where('meter_id', $validated['old_meter_id'])->update([
                        'meter_id' => null
                    ]);
                }
                break;

            case 'meter_reactivation':
                if ($validated['new_meter_id']) {
                    // Reactivate the meter for the customer
                    Customer::where('id', $validated['customer_id'])->update([
                        'meter_id' => $validated['new_meter_id']
                    ]);
                }
                break;
        }

        return redirect()->back()->with('success', 'Meter log created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MeterLog $meterLog)
    {
        $meterLog->load(['customer', 'oldMeter', 'newMeter', 'performedBy']);

        return Inertia::render('meter-logs/show', [
            'meterLog' => $meterLog
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MeterLog $meterLog)
    {
        $customers = Customer::active()->get();
        $meters = Meter::all();
        $users = User::all();

        return Inertia::render('meter-logs/edit', [
            'meterLog' => $meterLog,
            'customers' => $customers,
            'meters' => $meters,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MeterLog $meterLog)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'old_meter_id' => 'nullable|exists:meters,id',
            'new_meter_id' => 'nullable|exists:meters,id',
            'action_type' => 'required|in:initial_assignment,meter_replacement,meter_removal,meter_reactivation,meter_transfer,maintenance,upgrade,downgrade',
            'reason' => 'nullable|string',
            'effective_date' => 'required|date',
            'installation_date' => 'nullable|date',
            'old_meter_data' => 'nullable|array',
            'new_meter_data' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $meterLog->update($validated);

        return redirect()->route('meter-logs.index')->with('success', 'Meter log updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MeterLog $meterLog)
    {
        $meterLog->delete();

        return redirect()->route('meter-logs.index')->with('success', 'Meter log deleted successfully.');
    }

    /**
     * Get meter logs for a specific customer.
     */
    public function customerLogs(Customer $customer)
    {
        $meterLogs = MeterLog::where('customer_id', $customer->id)
            ->with(['oldMeter', 'newMeter', 'performedBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('meter-logs/customer-logs', [
            'customer' => $customer,
            'meterLogs' => $meterLogs
        ]);
    }

    /**
     * Get meter logs for a specific meter.
     */
    public function meterLogs(Meter $meter)
    {
        $meterLogs = MeterLog::where('old_meter_id', $meter->id)
            ->orWhere('new_meter_id', $meter->id)
            ->with(['customer', 'oldMeter', 'newMeter', 'performedBy'])
            ->latest()
            ->paginate(10);

        return Inertia::render('meter-logs/meter-logs', [
            'meter' => $meter,
            'meterLogs' => $meterLogs
        ]);
    }
}
