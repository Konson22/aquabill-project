<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = \App\Models\Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->zone_id, function ($query, $zoneId) {
                $query->whereHas('homes', function ($q) use ($zoneId) {
                    $q->where('zone_id', $zoneId);
                });
            })
            ->when($request->tariff_id, function ($query, $tariffId) {
                $query->whereHas('homes', function ($q) use ($tariffId) {
                    $q->where('tariff_id', $tariffId);
                });
            })
            ->withCount('homes')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'zone_id', 'tariff_id']),
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('customers/create', [
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'areas' => \App\Models\Area::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            // Home fields
            'address' => 'nullable|string|max:255',
            'plot_number' => 'nullable|string|max:50',
            'zone_id' => 'nullable|exists:zones,id',
            'area_id' => 'nullable|exists:areas,id',
            'tariff_id' => 'nullable|exists:tariffs,id',
            // Meter fields
            'meter_id' => 'nullable|exists:meters,id',
            'initial_reading' => 'nullable|numeric|min:0',
            // Invoice fields
            'installation_fee' => 'nullable|numeric|min:0',
        ]);

        $customer = \App\Models\Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
        ]);

        if (!empty($validated['address']) || !empty($validated['plot_number'])) {
            $home = $customer->homes()->create([
                'address' => $validated['address'],
                'plot_number' => $validated['plot_number'],
                'zone_id' => $validated['zone_id'],
                'area_id' => $validated['area_id'],
                'tariff_id' => $validated['tariff_id'],
            ]);

            // Assign Meter if provided
            if (!empty($validated['meter_id'])) {
                $meter = \App\Models\Meter::find($validated['meter_id']);
                if ($meter) {
                    $meter->update([
                        'home_id' => $home->id,
                        'installation_date' => now(),
                        'status' => 'active',
                    ]);

                    // Add initial reading if provided
                    if (isset($validated['initial_reading'])) {
                        $home->readings()->create([
                            'meter_id' => $meter->id,
                            'current_reading' => $validated['initial_reading'],
                            'previous_reading' => 0, // Assuming 0 for initial
                            'reading_date' => now(),
                            'reading_type' => 'Initial',
                        ]);
                    }
                }
            }

            // Create Invoice if fee provided
            if (!empty($validated['installation_fee']) && $validated['installation_fee'] > 0) {
                \App\Models\Invoice::create([
                    'invoice_number' => 'INV-' . strtoupper(uniqid()),
                    'customer_id' => $customer->id,
                    'home_id' => $home->id,
                    'type' => 'Installation Fee',
                    'description' => 'One-time installation fee',
                    'amount' => $validated['installation_fee'],
                    'due_date' => now()->addDays(30),
                    'status' => 'pending',
                ]);
            }
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function show($id)
    {
        $customer = \App\Models\Customer::with([
            'homes.meter.readings',
            'homes.readings',
            'homes.bills',
            'homes.bills.payments',
            'homes.invoices.payments'
        ])->findOrFail($id);
        
        return Inertia::render('customers/show', [
            'customer' => $customer,
            'zones' => \App\Models\Zone::with('areas')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
        ]);
    }

    public function home(\App\Models\Home $home)
    {
        $home->load([
            'meter', 
            'meterHistory.meter',
            'meterHistory.replacedBy',
            'readings' => function($query) {
                $query->latest()->limit(5);
            }, 
            'bills' => function($query) {
                $query->latest()->limit(10);
            }, 
            'invoices' => function($query) {
                $query->latest()->limit(10);
            },
            'customer',
            'zone',
            'area',
            'tariff'
        ]);

        $lastReading = $home->readings()->latest()->first();
        $unpaidBillsCount = $home->bills()->where('status', 'unpaid')->count();
        $unpaidBillsAmount = $home->bills()->where('status', 'unpaid')->sum('total_amount');
        $unpaidInvoicesCount = $home->invoices()->where('status', 'unpaid')->count();

        return Inertia::render('customers/customer-home', [
            'home' => $home,
            'overview' => [
                'last_reading' => $lastReading,
                'unpaid_bills_count' => $unpaidBillsCount,
                'unpaid_bills_amount' => $unpaidBillsAmount,
                'unpaid_invoices_count' => $unpaidInvoicesCount,
            ],
        ]);
    }

    public function edit($id)
    {
        $customer = \App\Models\Customer::with('homes.meter')->findOrFail($id);
        return Inertia::render('customers/edit', [
            'customer' => $customer,
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'areas' => \App\Models\Area::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        $customer = \App\Models\Customer::findOrFail($id);
        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy($id)
    {
        $customer = \App\Models\Customer::findOrFail($id);
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
