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
                ->with([
                    'zone',
                    'tariff',
                    'meters.lastReading',
                    'bills' => function ($q) {
                        $q->withSum('payments', 'amount')->latest();
                    },
                ]);

            // If user has a zone assigned, only fetch customers in that zone; otherwise fetch all.
            $zoneId = data_get($user, 'zone_id');
            $query->when($zoneId, function ($q) use ($zoneId) {
                $q->where('zone_id', $zoneId);
            });

            $customers = $query->latest()
                ->get()
                ->map(function ($customer) {
                    $meter = $customer->meters->sortByDesc('id')->first();
                    $lastReading = $meter?->lastReading;

                    return [
                        'home_id' => $customer->id,
                        'address' => $customer->address,
                        'plot_number' => null,
                        'customer_name' => $customer->name,
                        'meter' => $meter ? [
                            'id' => $meter->id,
                            'meter_number' => $meter->meter_number,
                            'status' => $meter->status,
                        ] : null,
                        'zone' => $customer->zone?->name,
                        'area' => null,
                        'tariff' => [
                            'name' => $customer->tariff?->name ?? 'N/A',
                            'price' => (float) ($customer->tariff?->price_per_unit ?? 0),
                            'fixed_charge' => (float) ($customer->tariff?->fixed_charge ?? 0),
                        ],
                        'latest_reading' => [
                            'current_reading' => (float) ($lastReading?->current_reading ?? 0),
                            'reading_date' => $lastReading?->reading_date ?? 'N/A',
                        ],
                        'previous_balance' => $this->previousBalanceFromLatestBill($customer),
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

    /**
     * Prefer balance_after on the latest payment for the latest bill; otherwise bill balance.
     */
    private function previousBalanceFromLatestBill(Customer $customer): float
    {
        $bill = $customer->bills->first();
        if (! $bill) {
            return 0;
        }

        $paid = (float) ($bill->payments_sum_amount ?? 0);
        $total = (float) $bill->total_amount;

        return round(max(0.0, $total - $paid), 2);
    }
}
