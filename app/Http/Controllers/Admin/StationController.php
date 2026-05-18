<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStationRequest;
use App\Models\Station;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StationController extends Controller
{
    /**
     * Collection desks / payment points used when recording payments.
     */
    public function index(): Response
    {
        $stations = Station::query()
            ->with([
                'zone:id,name',
                'accountant:id,name,email',
            ])
            ->orderBy('name')
            ->get();

        $zones = Zone::query()->orderBy('name')->get(['id', 'name']);

        $accountantChoices = User::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('admin/stations/index', [
            'stations' => $stations,
            'zones' => $zones,
            'accountantChoices' => $accountantChoices,
        ]);
    }

    public function store(StoreStationRequest $request): RedirectResponse
    {
        Station::query()->create($request->validated());

        return back()->with('success', 'Station created successfully.');
    }
}
