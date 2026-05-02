<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Lists customers (with address/meter) for API compatibility.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $query = Customer::query()
                ->with([
                    'zone',
                    'tariff',
                    'meters.latestReading',
                    'bills' => function ($q) {
                        $q->withSum('payments', 'amount')->latest();
                    },
                ]);

            // If user has a zone assigned, only fetch customers in that zone; otherwise fetch all.
            $zoneId = data_get($user, 'zone_id');
            $query->when($zoneId, function ($q) use ($zoneId) {
                $q->where('zone_id', $zoneId);
            });

            $payload = $query->latest()
                ->get()
                ->map(fn (Customer $customer): array => $this->formatCustomerForHomesApi($customer));

            return response()->json($payload);
        } catch (\Throwable $e) {
            Log::error('Failed to load customers (homes API)', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to load data.',
            ], 500);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCustomerForHomesApi(Customer $customer): array
    {
        $meter = $customer->meters->sortByDesc('id')->first();
        $lastReading = $meter?->latestReading;

        return [
            'customer_id' => $customer->id,
            'account_number' => $customer->account_number,
            'address' => $customer->address,
            'plot_number' => $customer->plot_no,
            'customer_name' => $customer->name,
            'address' => $customer->address,
            'phone' => $customer->phone,
            'meter' => $meter ? [
                'id' => $meter->id,
                'meter_number' => $meter->meter_number,
                'status' => $meter->status,
            ] : null,
            'zone' => $customer->zone?->name,
            'subzone' => $this->subzoneFromAddress($customer->address),
            'tariff' => [
                'name' => $customer->tariff?->name ?? 'N/A',
                'price' => (float) ($customer->tariff?->price_per_unit ?? 0),
                'fixed_charge' => (float) ($customer->tariff?->fixed_charge ?? 0),
            ],
            'latest_reading' => [
                'current_reading' => (float) ($meter?->last_reading ?? 0),
                'reading_date' => $this->formatReadingDateForApi($lastReading?->reading_date)
                    ?? $this->formatReadingDateForApi($customer->last_reading_date)
                    ?? 'N/A',
            ],
            'previous_balance' => $this->previousBalanceFromLatestBill($customer),
        ];
    }

    /**
     * Subzone/locality from the first segment of a comma-separated address (import shape: "HAI GWONGOROKI, Plot 2").
     */
    private function subzoneFromAddress(?string $address): ?string
    {
        $trimmed = trim((string) $address);
        if ($trimmed === '' || ! str_contains($trimmed, ',')) {
            return null;
        }

        $locality = trim(explode(',', $trimmed, 2)[0]);

        return $locality !== '' ? $locality : null;
    }

    /**
     * @param  mixed  $value  Carbon instance, date string, or null
     */
    private function formatReadingDateForApi(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toDateString();
        }

        if (is_string($value)) {
            return Carbon::parse($value)->toDateString();
        }

        return null;
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
