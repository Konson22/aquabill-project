<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterHistory;
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
            'last_reading' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive,maintenance,damage'],
        ]);

        $lastReading = (float) ($validated['last_reading'] ?? 0);

        $meter = Meter::query()->create([
            'customer_id' => $validated['customer_id'] ?? null,
            'meter_number' => $validated['meter_number'],
            'last_reading' => $lastReading,
            'status' => $validated['status'],
        ]);

        if ($lastReading > 0 && $meter->customer_id) {
            Customer::query()->whereKey($meter->customer_id)->update([
                'last_reading_date' => now()->toDateString(),
            ]);
        }

        return back()->with('success', 'Meter created successfully.');
    }

    public function update(Request $request, Meter $meter): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,maintenance,damage'],
        ]);

        $meter->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Meter status updated successfully.');
    }

    public function replace(Request $request, Meter $meter): RedirectResponse
    {
        $validated = $request->validate([
            'final_reading' => ['required', 'numeric', 'min:0'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'new_meter_id' => ['required', 'exists:meters,id'],
            'new_meter_status' => ['required', 'in:active,inactive,maintenance,damage'],
        ]);

        \DB::transaction(function () use ($meter, $validated) {
            // 1. Record history for the old meter
            MeterHistory::create([
                'meter_id' => $meter->id,
                'customer_id' => $meter->customer_id,
                'final_reading' => $validated['final_reading'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'],
                'unassigned_at' => now(),
                'replaced_by' => auth()->id(),
            ]);

            // 2. Unassign and deactivate the old meter
            $customerId = $meter->customer_id;
            $meter->update([
                'customer_id' => null,
                'status' => 'inactive',
            ]);

            // 3. Assign the existing unassigned meter
            $newMeter = Meter::findOrFail($validated['new_meter_id']);
            $newMeter->update([
                'customer_id' => $customerId,
                'status' => $validated['new_meter_status'],
            ]);
        });

        return back()->with('success', 'Meter replaced successfully.');
    }
}
