<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
            'plot_no' => 'nullable|string|max:255',
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
            'plot_no' => $validated['plot_no'] ?? null,
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
                'status' => 'pending',
            ]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $zoneId = $request->input('zone_id');

        $customers = Customer::query()
            ->with(['zone', 'tariff', 'meters'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%")
                        ->orWhere('plot_no', 'like', "%{$search}%")
                        ->orWhereHas('meters', function ($mq) use ($search) {
                            $mq->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($zoneId, function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->latest()
            ->paginate(100)
            ->withQueryString();

        $this->attachScopedLastReadingsToCustomers($customers->getCollection());

        $serviceChargeTypes = ServiceChargeType::all();
        $zones = Zone::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'serviceChargeTypes' => $serviceChargeTypes,
            'zones' => $zones,
            'filters' => $request->only(['search', 'zone_id']),
        ]);
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'zone',
            'tariff',
            'meters',
            'bills' => fn ($query) => $query->latest()->limit(50),
            'readings' => fn ($query) => $query->latest()->limit(50),
            'serviceCharges' => fn ($query) => $query->latest()->limit(50),
            'meterHistories' => fn ($query) => $query->with(['meter', 'replacedBy'])->latest(),
            'disconnections' => fn ($query) => $query->with(['disconnectedBy', 'reconnectedBy'])->latest(),
        ]);
        $this->attachScopedLastReadingsToCustomers(collect([$customer]));

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'unassignedMeters' => Meter::whereNull('customer_id')->where('status', 'active')->get(['id', 'meter_number', 'last_reading']),
        ]);
    }

    private function attachScopedLastReadingsToCustomers(Collection $customers): void
    {
        $meters = $customers
            ->flatMap(fn (Customer $customer) => $customer->meters)
            ->filter(fn (Meter $meter) => $meter->customer_id !== null)
            ->values();

        if ($meters->isEmpty()) {
            return;
        }

        $meterIds = $meters->pluck('id')->unique()->all();
        $customerIds = $meters->pluck('customer_id')->unique()->all();

        $latestReadings = MeterReading::query()
            ->whereIn('meter_id', $meterIds)
            ->whereIn('customer_id', $customerIds)
            ->orderByDesc('reading_date')
            ->orderByDesc('id')
            ->get()
            ->unique(fn (MeterReading $reading) => $reading->meter_id.'-'.$reading->customer_id)
            ->keyBy(fn (MeterReading $reading) => $reading->meter_id.'-'.$reading->customer_id);

        $meters->each(function (Meter $meter) use ($latestReadings): void {
            $key = $meter->id.'-'.$meter->customer_id;
            $meter->setRelation('latestReading', $latestReadings->get($key));
        });
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => $customer,
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'national_id' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'plot_no' => 'nullable|string|max:255',
            'customer_type' => 'required|string|in:residential,commercial,government',
            'status' => 'required|string|in:active,inactive',
            'zone_id' => 'required|exists:zones,id',
            'tariff_id' => 'required|exists:tariffs,id',
            'connection_date' => 'nullable|date',
        ]);

        $customer->update($validated);

        return redirect()->route('customers.show', $customer->id)->with('success', 'Customer updated successfully.');
    }
}
