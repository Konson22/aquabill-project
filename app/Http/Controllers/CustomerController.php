<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('customers/create', [
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
            'existingMeters' => Meter::query()
                ->with('customer:id,name')
                ->orderBy('meter_number')
                ->get(['id', 'meter_number', 'customer_id']),
            'serviceChargeTypes' => ServiceChargeType::query()->orderBy('name')->get(['id', 'name', 'amount']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'national_id' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'customer_type' => 'required|string|in:residential,commercial,government',
            'status' => 'required|string|in:active,inactive',
            'zone_id' => 'required|exists:zones,id',
            'tariff_id' => 'required|exists:tariffs,id',
            'connection_date' => 'nullable|date',
            // Meter validation
            'meter_setup_mode' => 'nullable|string|in:existing,new,none',
            'existing_meter_id' => 'nullable|required_if:meter_setup_mode,existing|exists:meters,id',
            'new_meter_number' => 'nullable|required_if:meter_setup_mode,new|string|unique:meters,meter_number',
            'new_meter_status' => 'nullable|required_if:meter_setup_mode,new|string|in:active,inactive,maintenance,damage',
            // Service Charge validation
            'apply_service_charge' => 'boolean',
            'service_charge_type_id' => 'nullable|required_if:apply_service_charge,true|exists:service_charge_types,id',
            'service_charge_amount' => 'nullable|required_if:apply_service_charge,true|numeric|min:0',
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'national_id' => $validated['national_id'],
            'address' => $validated['address'],
            'customer_type' => $validated['customer_type'],
            'status' => $validated['status'],
            'zone_id' => $validated['zone_id'],
            'tariff_id' => $validated['tariff_id'],
            'connection_date' => $validated['connection_date'] ?? now(),
        ]);

        if ($request->meter_setup_mode === 'existing' && $request->existing_meter_id) {
            $meter = Meter::find($request->existing_meter_id);
            if ($meter) {
                $meter->update(['customer_id' => $customer->id]);
            }
        } elseif ($request->meter_setup_mode === 'new' && $request->new_meter_number) {
            Meter::create([
                'customer_id' => $customer->id,
                'meter_number' => $request->new_meter_number,
                'status' => $request->new_meter_status ?? 'active',
            ]);
        }

        if ($request->apply_service_charge && $request->service_charge_type_id) {
            ServiceCharge::create([
                'customer_id' => $customer->id,
                'service_charge_type_id' => $request->service_charge_type_id,
                'amount' => $request->service_charge_amount,
                'issued_by' => auth()->id(),
                'issued_date' => now(),
                'status' => 'unpaid',
            ]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function index(): Response
    {
        $customers = Customer::with(['zone', 'tariff', 'meters.lastReading'])
            ->latest()
            ->paginate(100);

        $serviceChargeTypes = ServiceChargeType::all();

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'serviceChargeTypes' => $serviceChargeTypes,
        ]);
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'zone',
            'tariff',
            'meters.lastReading',
            'bills' => fn ($query) => $query->latest()->limit(50),
            'readings' => fn ($query) => $query->latest()->limit(50),
            'payments' => fn ($query) => $query->latest()->limit(50),
            'serviceCharges' => fn ($query) => $query->latest()->limit(50),
            'meterHistories' => fn ($query) => $query->with(['meter', 'replacedBy'])->latest(),
            'disconnections' => fn ($query) => $query->with(['disconnectedBy', 'reconnectedBy'])->latest(),
        ]);

        return Inertia::render('customers/show', [
            'customer' => $customer,
        ]);
    }
}
