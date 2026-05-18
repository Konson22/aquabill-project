<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $search = trim((string) $request->input('search', ''));
            $status = trim((string) $request->input('status', 'all'));
            if ($status === '') {
                $status = 'all';
            }
            $perPage = min(max((int) $request->input('per_page', 15), 1), 100);

            $bills = $this->baseQuery($request)
                ->when($status === 'pending', function ($query) {
                    $query->where('status', 'pending')
                        ->whereDate('due_date', '>=', Carbon::today());
                })
                ->when($status === 'partial', fn ($query) => $query->where('status', 'partial'))
                ->when($status === 'forwarded', fn ($query) => $query->where('status', 'forwarded'))
                ->when($status === 'paid', fn ($query) => $query->where('status', 'paid'))
                ->when($status === 'overdue', function ($query) {
                    $query->whereIn('status', ['pending', 'partial'])
                        ->whereDate('due_date', '<', Carbon::today());
                })
                ->when(
                    $status !== 'all'
                        && ! in_array($status, ['pending', 'partial', 'forwarded', 'paid', 'overdue'], true),
                    fn ($query) => $query->where('status', $status),
                )
                ->when($search !== '', function ($query) use ($search): void {
                    $pattern = '%'.addcslashes($search, '%_\\').'%';
                    $query->where(function ($q) use ($pattern): void {
                        $q->where('bills.bill_no', 'like', $pattern)
                            ->orWhere('bills.meter_number', 'like', $pattern)
                            ->orWhereHas('customer', function ($cq) use ($pattern): void {
                                $cq->where('name', 'like', $pattern)
                                    ->orWhere('phone', 'like', $pattern)
                                    ->orWhere('account_number', 'like', $pattern);
                            })
                            ->orWhereHas('customer.zone', function ($zq) use ($pattern): void {
                                $zq->where('name', 'like', $pattern);
                            })
                            ->orWhereHas('meter', function ($mq) use ($pattern): void {
                                $mq->where('meter_number', 'like', $pattern);
                            });
                    });
                })
                ->latest()
                ->paginate($perPage)
                ->withQueryString();

            $bills->getCollection()->transform(
                fn (Bill $bill): array => $this->formatBillForApi($bill),
            );

            return response()->json($bills);
        } catch (\Throwable $e) {
            Log::error('Failed to load bills (API)', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to load bills.',
            ], 500);
        }
    }

    public function show(Request $request, Bill $bill): JsonResponse
    {
        try {
            if (! $this->billIsAccessibleToUser($request, $bill)) {
                return response()->json([
                    'message' => 'Bill not found.',
                ], 404);
            }

            $bill->load([
                'customer.zone',
                'customer.tariff:id,name,price_per_unit,fixed_charge',
                'meter:id,meter_number,status,customer_id',
                'reading:id,reading_date,previous_reading,current_reading,consumption',
            ]);
            $bill->loadSum('payments', 'amount');

            return response()->json($this->formatBillForApi($bill));
        } catch (\Throwable $e) {
            Log::error('Failed to load bill (API)', [
                'bill_id' => $bill->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to load bill.',
            ], 500);
        }
    }

    /**
     * @return Builder<Bill>
     */
    private function baseQuery(Request $request)
    {
        $zoneId = data_get($request->user(), 'zone_id');
        $customerId = (int) $request->input('customer_id', 0);

        return Bill::query()
            ->with([
                'customer:id,name,account_number,phone,zone_id',
                'customer.zone:id,name',
                'meter:id,meter_number,status,customer_id',
                'reading:id,reading_date,previous_reading,current_reading,consumption',
            ])
            ->withSum('payments', 'amount')
            ->when($zoneId !== null && $zoneId !== '', function ($query) use ($zoneId) {
                $query->whereHas('customer', fn ($customerQuery) => $customerQuery->where('zone_id', $zoneId));
            })
            ->when($customerId > 0, fn ($query) => $query->where('customer_id', $customerId));
    }

    private function billIsAccessibleToUser(Request $request, Bill $bill): bool
    {
        $zoneId = data_get($request->user(), 'zone_id');
        if ($zoneId === null || $zoneId === '') {
            return true;
        }

        $bill->loadMissing('customer:id,zone_id');

        return (int) $bill->customer?->zone_id === (int) $zoneId;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatBillForApi(Bill $bill): array
    {
        $customer = $bill->customer;
        $reading = $bill->reading;

        return [
            'id' => $bill->id,
            'bill_no' => $bill->bill_no,
            'customer_id' => $bill->customer_id,
            'customer_name' => $customer?->name,
            'account_number' => $customer?->account_number,
            'phone' => $customer?->phone,
            'zone' => $customer?->zone?->name,
            'meter_id' => $bill->meter_id,
            'meter_number' => $bill->meter_number ?? $bill->meter?->meter_number,
            'consumption' => (float) ($bill->consumption ?? 0),
            'unit_price' => (float) ($bill->unit_price ?? 0),
            'fixed_charge' => (float) ($bill->fixed_charge ?? 0),
            'current_charge' => (float) ($bill->current_charge ?? 0),
            'previous_balance' => (float) ($bill->previous_balance ?? 0),
            'total_amount' => (float) ($bill->total_amount ?? 0),
            'amount_paid' => (float) $bill->amount_paid,
            'current_balance' => (float) $bill->current_balance,
            'status' => $bill->status,
            'due_date' => $bill->due_date?->toDateString(),
            'reading' => $reading ? [
                'id' => $reading->id,
                'reading_date' => $reading->reading_date?->toDateString(),
                'previous_reading' => (float) ($reading->previous_reading ?? 0),
                'current_reading' => (float) ($reading->current_reading ?? 0),
                'consumption' => (float) ($reading->consumption ?? 0),
            ] : null,
            'tariff' => $customer?->tariff ? [
                'name' => $customer->tariff->name,
                'price_per_unit' => (float) $customer->tariff->price_per_unit,
                'fixed_charge' => (float) $customer->tariff->fixed_charge,
            ] : null,
            'created_at' => $bill->created_at?->toIso8601String(),
            'updated_at' => $bill->updated_at?->toIso8601String(),
        ];
    }
}
