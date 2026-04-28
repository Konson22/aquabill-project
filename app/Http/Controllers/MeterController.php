<?php

namespace App\Http\Controllers;

use App\Models\Meter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeterController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search')->trim();

        $meters = Meter::with(['customer'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('meter_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('meters/index', [
            'meters' => $meters,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'meter_number' => ['required', 'string', 'max:255', 'unique:meters,meter_number'],
            'status' => ['required', 'in:active,inactive,broken'],
        ]);

        Meter::query()->create([
            'customer_id' => $validated['customer_id'] ?? null,
            'meter_number' => $validated['meter_number'],
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Meter created successfully.');
    }
}
