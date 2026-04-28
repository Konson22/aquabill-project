<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\ServiceChargeType;
use App\Models\Tariff;
use App\Models\Zone;
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
        ]);
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
        ]);

        return Inertia::render('customers/show', [
            'customer' => $customer,
        ]);
    }
}
