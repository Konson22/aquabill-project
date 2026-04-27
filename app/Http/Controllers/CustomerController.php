<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::with(['zone', 'tariff', 'meters.lastReading'])
            ->latest()
            ->paginate(100);

        $serviceChargeTypes = \App\Models\ServiceChargeType::all();

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
