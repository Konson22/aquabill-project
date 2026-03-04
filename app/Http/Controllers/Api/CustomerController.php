<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Lists customers (with address/meter) for API compatibility.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $query = Customer::query()
                ->has('meter')
                ->with([
                    'meter',
                    'zone',
                    'area',
                    'tariff',
                    'latestReading',
                ]);

            // If user has a zone assigned, only fetch customers in that zone; otherwise fetch all.
            $query->when($user?->zone_id, function ($q) use ($user) {
                $q->where('zone_id', $user->zone_id);
            });

            $customers = $query->latest()
                ->get()
                ->map(function ($customer) {
                    return [
                        'home_id' => $customer->id,
                        'address' => $customer->address,
                        'plot_number' => $customer->plot_number,
                        'customer_name' => $customer->name,
                        'meter' => $customer->meter ? [
                            'id' => $customer->meter->id,
                            'meter_number' => $customer->meter->meter_number,
                            'status' => $customer->meter->status,
                        ] : null,
                        'zone' => $customer->zone?->name,
                        'area' => $customer->area?->name,
                        'tariff' => [
                            'name' => $customer->tariff?->name ?? 'N/A',
                            'price' => $customer->tariff?->price ?? 0,
                            'fixed_charge' => $customer->tariff?->fixed_charge ?? 0,
                        ],
                        'latest_reading' => [
                            'current_reading' => $customer->latestReading?->current_reading ?? 0,
                            'reading_date' => $customer->latestReading?->reading_date ?? 'N/A',
                        ],
                    ];
                });
        } catch (\Throwable $e) {
            Log::error('Failed to load customers (homes API)', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to load data.',
            ], 500);
        }

        return response()->json($customers);
    }
}
