<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Finance\Concerns\RendersFinanceOrAdminInertia;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    use RendersFinanceOrAdminInertia;

    public function index()
    {
        // Assuming relationship is 'homes' as per previous view, but effectively homes represent customer connection points
        // The Tariff model has 'homes' relationship.
        $tariffs = \App\Models\Tariff::withCount('homes')->latest()->paginate(10);

        return $this->renderFinanceOrAdmin('tariff/index', [
            'tariffs' => $tariffs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tariffs,name'],
            'price' => ['required', 'numeric', 'min:0'],
            'fixed_charge' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $tariff = \App\Models\Tariff::create($validated);

        // Create initial history record
        $tariff->histories()->create([
            'name' => $tariff->name,
            'price' => $tariff->price,
            'fixed_charge' => $tariff->fixed_charge,
            'description' => $tariff->description,
            'effective_from' => now(),
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Tariff created successfully.');
    }

    public function update(Request $request, \App\Models\Tariff $tariff)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tariffs,name,'.$tariff->id],
            'price' => ['required', 'numeric', 'min:0'],
            'fixed_charge' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        // Archive current tariff state to history if price or fixed_charge changes
        if ($tariff->price != $request->price || $tariff->fixed_charge != $request->fixed_charge) {
            // Close the previous history record if exists?
            // For simplicity, we just log the new version or the old version.
            // Let's log the *old* version as being effective until now.
            // Actually, usually you want to see what the price WAS.

            // Let's assume we want to track the change.
            // We can just create a history record for the OLD data.
            $tariff->histories()->create([
                'name' => $tariff->name,
                'price' => $tariff->price,
                'fixed_charge' => $tariff->fixed_charge,
                'description' => $tariff->description,
                'effective_from' => $tariff->updated_at, // Use the last update time as the start of this period
                'effective_to' => now(), // It was effective until now
                'created_by' => auth()->id(), // modifying user
            ]);
        }

        $tariff->update($validated);

        // Create a new open-ended history record for the NEW price?
        // Or just rely on the current table for current price.

        // Let's stick to the user request "update TariffHistory".
        // A common pattern is:
        // 1. Current table holds current active rates.
        // 2. History table holds past rates.

        return redirect()->back()->with('success', 'Tariff updated successfully.');
    }

    public function show(\App\Models\Tariff $tariff)
    {
        $tariff->load(['histories' => function ($query) {
            $query->latest('effective_to');
        }, 'histories.creator']);

        return $this->renderFinanceOrAdmin('tariff/show', [
            'tariff' => $tariff,
        ]);
    }

    public function print(\App\Models\Tariff $tariff)
    {
        $tariff->load(['histories' => function ($query) {
            $query->latest('effective_to');
        }, 'histories.creator']);

        return $this->renderFinanceOrAdmin('tariff/print', [
            'tariff' => $tariff,
        ]);
    }
}
