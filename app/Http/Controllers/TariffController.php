<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TariffController extends Controller
{
    public function index(): Response
    {
        $tariffs = Tariff::latest()->get();

        return Inertia::render('tariff/index', [
            'tariffs' => $tariffs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tariffs,name'],
            'price_per_unit' => ['required', 'numeric', 'min:0'],
            'fixed_charge' => ['required', 'numeric', 'min:0'],
        ]);

        Tariff::create($validated);

        return back()->with('success', 'Tariff created successfully.');
    }

    public function show(Tariff $tariff): Response
    {
        $tariff->load([
            'histories' => fn ($query) => $query->latest(),
        ]);

        return Inertia::render('tariff/show', [
            'tariff' => $tariff,
        ]);
    }

    public function update(Request $request, Tariff $tariff): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('tariffs', 'name')->ignore($tariff->id)],
            'price_per_unit' => ['required', 'numeric', 'min:0'],
            'fixed_charge' => ['required', 'numeric', 'min:0'],
        ]);

        $tariff->histories()->create([
            'name' => $tariff->name,
            'price_per_unit' => $tariff->price_per_unit,
            'fixed_charge' => $tariff->fixed_charge,
            'created_by' => $request->user()?->id,
        ]);

        $tariff->update($validated);

        return back()->with('success', 'Tariff updated successfully.');
    }

    public function destroy(Tariff $tariff): RedirectResponse
    {
        $tariff->delete();

        return back()->with('success', 'Tariff deleted successfully.');
    }
}
