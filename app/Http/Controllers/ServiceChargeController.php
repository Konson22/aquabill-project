<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\ServiceChargeType;
use App\Models\Station;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ServiceChargeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->input('status', 'all');
        if (! in_array($status, ['all', 'paid', 'unpaid'], true)) {
            $status = 'all';
        }

        $baseQuery = ServiceCharge::query()
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $inner) use ($search): void {
                    $inner->whereHas('customer', function (Builder $customerQuery) use ($search): void {
                        $customerQuery->where('name', 'like', '%'.$search.'%')
                            ->orWhere('account_number', 'like', '%'.$search.'%');
                    })->orWhereHas('serviceChargeType', function (Builder $typeQuery) use ($search): void {
                        $typeQuery->where('name', 'like', '%'.$search.'%')
                            ->orWhere('code', 'like', '%'.$search.'%');
                    });
                });
            });

        $filteredQuery = (clone $baseQuery)
            ->when($status !== 'all', fn (Builder $query) => $query->where('status', $status));

        $charges = (clone $filteredQuery)
            ->with(['customer', 'serviceChargeType', 'issuer'])
            ->latest('issued_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('service-charges/index', [
            'charges' => $charges,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'status' => $status,
            ],
            'statusCounts' => [
                'all' => (int) (clone $baseQuery)->count(),
                'unpaid' => (int) (clone $baseQuery)->where('status', 'unpaid')->count(),
                'paid' => (int) (clone $baseQuery)->where('status', 'paid')->count(),
            ],
            'summary' => $this->serviceChargesIndexSummary($filteredQuery),
            'stations' => Station::query()
                ->with(['accountant:id,name,email'])
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'zone_id',
                    'accountant_id',
                    'manager_name',
                    'manager_phone',
                    'coordinate',
                ]),
        ]);
    }

    /**
     * @param  Builder<ServiceCharge>  $query
     * @return array{
     *     total_count: int,
     *     total_amount: float,
     *     unpaid_count: int,
     *     unpaid_amount: float,
     *     paid_count: int,
     *     paid_amount: float
     * }
     */
    private function serviceChargesIndexSummary(Builder $query): array
    {
        $unpaidQuery = (clone $query)->where('status', 'unpaid');
        $paidQuery = (clone $query)->where('status', 'paid');

        return [
            'total_count' => (int) (clone $query)->count(),
            'total_amount' => ServiceCharge::sumTotalDue(clone $query),
            'unpaid_count' => (int) $unpaidQuery->count(),
            'unpaid_amount' => ServiceCharge::sumTotalDue($unpaidQuery),
            'paid_count' => (int) $paidQuery->count(),
            'paid_amount' => ServiceCharge::sumTotalDue($paidQuery),
        ];
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
        if ($request->input('other_charges') === '' || $request->input('other_charges') === null) {
            $request->merge(['other_charges' => 0]);
        }

        $validated = $request->validate([
            'service_charge_type_id' => 'required|exists:service_charge_types,id',
            'other_charges' => 'nullable|numeric|min:0',
            'issued_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $chargeType = ServiceChargeType::query()->findOrFail($validated['service_charge_type_id']);

        if ((float) $chargeType->amount < 0.01) {
            return back()
                ->withErrors([
                    'service_charge_type_id' => 'The selected service charge type has no valid amount configured.',
                ])
                ->withInput();
        }

        $serviceCharge = ServiceCharge::create([
            'customer_id' => $customer->id,
            'service_charge_type_id' => $validated['service_charge_type_id'],
            'amount' => $chargeType->amount,
            'other_charges' => isset($validated['other_charges']) ? (float) $validated['other_charges'] : 0,
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
            'payments' => fn ($query) => $query->orderByDesc('payment_date')->orderByDesc('id'),
        ]);

        return Inertia::render('service-charges/show', [
            'charge' => $serviceCharge,
            'stations' => Station::query()
                ->with(['accountant:id,name,email'])
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'zone_id',
                    'accountant_id',
                    'manager_name',
                    'manager_phone',
                    'coordinate',
                ]),
        ]);
    }

    /**
     * Printer-friendly service charge receipt.
     */
    public function print(ServiceCharge $serviceCharge): Response
    {
        $serviceCharge->load([
            'customer.zone',
            'serviceChargeType',
            'issuer:id,name,email',
            'payments' => fn ($query) => $query->orderByDesc('payment_date')->orderByDesc('id'),
        ]);

        return Inertia::render('service-charges/print', [
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

        $this->normalizeStationRequest($request);

        $stationRules = Station::query()->exists()
            ? ['required', 'integer', Rule::exists('stations', 'id')]
            : ['nullable', 'integer', Rule::exists('stations', 'id')];

        $validated = $request->validate([
            'payment_method' => ['nullable', Rule::in(['cash', 'bank', 'mobile_money', 'cheque'])],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'station_id' => $stationRules,
        ]);

        DB::transaction(function () use ($charge, $validated): void {
            $charge->update([
                'status' => 'paid',
            ]);

            $charge->payments()->create([
                'amount' => $charge->totalDueFloat(),
                'current_balance' => 0.0,
                'payment_date' => now()->toDateString(),
                'payment_method' => $validated['payment_method'] ?? 'cash',
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'recorded_by' => auth()->id(),
                'station_id' => $validated['station_id'] ?? null,
            ]);
        });

        return back()->with('success', 'Service charge payment confirmed.');
    }

    private function normalizeStationRequest(Request $request): void
    {
        $raw = $request->input('station_id');

        if ($raw === '' || $raw === null) {
            $request->merge(['station_id' => null]);
        } elseif (is_numeric($raw)) {
            $request->merge(['station_id' => (int) $raw]);
        }
    }
}
