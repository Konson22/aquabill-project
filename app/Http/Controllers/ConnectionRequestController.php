<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConnectionRequestRequest;
use App\Models\ConnectionRequest;
use App\Models\ConnectionRequestItem;
use App\Models\Customer;
use App\Models\ServiceCharge;
use App\Models\Tariff;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConnectionRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        $requests = ConnectionRequest::query()
            ->with(['zone:id,name', 'tariff:id,name'])
            ->when(
                in_array($status, ['pending', 'paid', 'completed', 'cancelled'], true),
                fn ($query) => $query->where('status', $status)
            )
            ->latest('issued_date')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('connection-requests/index', [
            'connectionRequests' => $requests,
            'filters' => [
                'status' => in_array($status, ['pending', 'paid', 'completed', 'cancelled'], true) ? $status : 'all',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('connection-requests/create', [
            'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
            'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreConnectionRequestRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $connectionRequest = DB::transaction(function () use ($validated): ConnectionRequest {
            $connectionRequest = ConnectionRequest::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'national_id' => $validated['national_id'] ?? null,
                'address' => $validated['address'],
                'plot_no' => $validated['plot_no'] ?? null,
                'customer_type' => $validated['customer_type'],
                'zone_id' => $validated['zone_id'],
                'tariff_id' => $validated['tariff_id'],
                'status' => 'pending',
                'total_amount' => 0,
                'issued_date' => $validated['issued_date'],
                'issued_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $index => $item) {
                ConnectionRequestItem::create([
                    'connection_request_id' => $connectionRequest->id,
                    'service_charge_type_id' => $item['service_charge_type_id'] ?? null,
                    'description' => $item['description'],
                    'amount' => $item['amount'],
                    'quantity' => $item['quantity'],
                    'sort_order' => $index,
                ]);
            }

            $connectionRequest->recalculateTotalAmount();

            return $connectionRequest;
        });

        return redirect()
            ->route('connection-requests.show', $connectionRequest)
            ->with('success', 'Connection request created successfully.');
    }

    public function show(ConnectionRequest $connectionRequest): Response
    {
        $connectionRequest->load([
            'zone:id,name',
            'tariff:id,name',
            'issuer:id,name,email',
            'customer:id,name,account_number',
            'items.serviceChargeType:id,name,code',
        ]);

        return Inertia::render('connection-requests/show', [
            'connectionRequest' => $connectionRequest,
        ]);
    }

    public function print(ConnectionRequest $connectionRequest): Response
    {
        $connectionRequest->load([
            'zone:id,name',
            'tariff:id,name',
            'issuer:id,name',
            'items' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        return Inertia::render('connection-requests/print', [
            'connectionRequest' => $connectionRequest,
        ]);
    }

    public function markPaid(ConnectionRequest $connectionRequest): RedirectResponse
    {
        if (! $connectionRequest->isPending()) {
            return back()->with('error', 'Only pending requests can be marked as paid.');
        }

        $connectionRequest->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Connection request marked as paid.');
    }

    public function convertToCustomer(ConnectionRequest $connectionRequest): RedirectResponse
    {
        if (! $connectionRequest->isPaid()) {
            return back()->with('error', 'Only paid requests can be converted to a customer account.');
        }

        if ($connectionRequest->customer_id !== null) {
            return back()->with('error', 'This request has already been converted.');
        }

        $customer = DB::transaction(function () use ($connectionRequest): Customer {
            $customer = Customer::create([
                'name' => $connectionRequest->name,
                'phone' => $connectionRequest->phone,
                'email' => $connectionRequest->email,
                'national_id' => $connectionRequest->national_id,
                'address' => $connectionRequest->address,
                'plot_no' => $connectionRequest->plot_no,
                'customer_type' => $connectionRequest->customer_type,
                'status' => 'active',
                'zone_id' => $connectionRequest->zone_id,
                'tariff_id' => $connectionRequest->tariff_id,
                'connection_date' => now(),
            ]);

            $connectionRequest->load('items');

            foreach ($connectionRequest->items as $item) {
                if ($item->service_charge_type_id === null) {
                    continue;
                }

                ServiceCharge::create([
                    'customer_id' => $customer->id,
                    'service_charge_type_id' => $item->service_charge_type_id,
                    'amount' => $item->amount,
                    'other_charges' => 0,
                    'issued_by' => Auth::id(),
                    'issued_date' => now(),
                    'status' => 'unpaid',
                    'notes' => "From connection request {$connectionRequest->request_number}",
                ]);
            }

            $connectionRequest->update([
                'customer_id' => $customer->id,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            return $customer;
        });

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Customer account created from connection request.');
    }

    public function cancel(ConnectionRequest $connectionRequest): RedirectResponse
    {
        if ($connectionRequest->isCompleted()) {
            return back()->with('error', 'Completed requests cannot be cancelled.');
        }

        if ($connectionRequest->isCancelled()) {
            return back()->with('error', 'This request is already cancelled.');
        }

        $connectionRequest->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Connection request cancelled.');
    }
}
