<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PaymentsReportService
{
    /**
     * @return array{
     *     payments: LengthAwarePaginator<int, array<string, mixed>>,
     *     summary: array{payments_count: int, total_amount: float},
     *     filters: array<string, int|string|null>,
     *     filterOptions: array<string, mixed>
     * }
     */
    public function build(Request $request): array
    {
        $filters = $this->validatedFilters($request);

        $query = $this->baseQuery($filters);

        $summary = [
            'payments_count' => (int) (clone $query)->count(),
            'total_amount' => (float) (clone $query)->sum('amount'),
        ];

        $payments = $query
            ->with([
                'station:id,name',
                'recorder:id,name',
            ])
            ->with(['payable' => function (MorphTo $morphTo): void {
                $morphTo->morphWith([
                    Bill::class => [
                        'customer:id,name,account_number,zone_id,tariff_id',
                        'customer.zone:id,name',
                        'customer.tariff:id,name',
                    ],
                    ServiceCharge::class => [
                        'customer:id,name,account_number,zone_id,tariff_id',
                        'customer.zone:id,name',
                        'customer.tariff:id,name',
                    ],
                ]);
            }])
            ->orderByDesc('payment_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Payment $payment): array => $this->formatPaymentRow($payment));

        return [
            'payments' => $payments,
            'summary' => $summary,
            'filters' => $filters,
            'filterOptions' => [
                'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
                'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
                'users' => User::query()
                    ->whereIn('id', Payment::query()->whereNotNull('recorded_by')->distinct()->pluck('recorded_by'))
                    ->orderBy('name')
                    ->get(['id', 'name']),
            ],
        ];
    }

    /**
     * @return array{
     *     filters: array<string, int|string|null>,
     *     summary: array{payments_count: int, total_amount: float},
     *     rows: array<int, array<string, mixed>>
     * }
     */
    public function dataForExport(Request $request): array
    {
        $filters = $this->validatedFilters($request);
        $query = $this->baseQuery($filters);

        $summary = [
            'payments_count' => (int) (clone $query)->count(),
            'total_amount' => (float) (clone $query)->sum('amount'),
        ];

        /** @var Collection<int, Payment> $payments */
        $payments = $query
            ->with([
                'station:id,name',
                'recorder:id,name',
            ])
            ->with(['payable' => function (MorphTo $morphTo): void {
                $morphTo->morphWith([
                    Bill::class => [
                        'customer:id,name,account_number,zone_id,tariff_id',
                        'customer.zone:id,name',
                        'customer.tariff:id,name',
                    ],
                    ServiceCharge::class => [
                        'customer:id,name,account_number,zone_id,tariff_id',
                        'customer.zone:id,name',
                        'customer.tariff:id,name',
                    ],
                ]);
            }])
            ->orderByDesc('payment_date')
            ->orderByDesc('id')
            ->get();

        $rows = $payments
            ->map(fn (Payment $payment): array => $this->formatPaymentRow($payment))
            ->values()
            ->all();

        return [
            'filters' => $filters,
            'summary' => $summary,
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, int|string|null>  $filters
     * @return Builder<Payment>
     */
    private function baseQuery(array $filters): Builder
    {
        $payableTypes = match ($filters['payment_type']) {
            'bill' => [Bill::class],
            'service_charge' => [ServiceCharge::class],
            default => [Bill::class, ServiceCharge::class],
        };

        return Payment::query()
            ->whereIn('payable_type', $payableTypes)
            ->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('payment_date', '>=', $from))
            ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('payment_date', '<=', $to))
            ->when($filters['recorded_by'], fn (Builder $q, int $userId) => $q->where('recorded_by', $userId))
            ->when($filters['zone_id'] || $filters['tariff_id'], function (Builder $q) use ($filters): void {
                $q->whereHasMorph('payable', [Bill::class, ServiceCharge::class], function (Builder $payableQuery) use ($filters): void {
                    $payableQuery->whereHas('customer', function (Builder $customerQuery) use ($filters): void {
                        if ($filters['zone_id']) {
                            $customerQuery->where('zone_id', $filters['zone_id']);
                        }
                        if ($filters['tariff_id']) {
                            $customerQuery->where('tariff_id', $filters['tariff_id']);
                        }
                    });
                });
            });
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPaymentRow(Payment $payment): array
    {
        $payable = $payment->payable;
        $customer = null;

        if ($payable instanceof Bill || $payable instanceof ServiceCharge) {
            $customer = $payable->customer;
        }

        $reference = '—';
        $type = 'unknown';
        $typeLabel = '—';

        if ($payable instanceof Bill) {
            $type = 'bill';
            $typeLabel = 'Bill';
            $reference = filled($payable->bill_no)
                ? (string) $payable->bill_no
                : 'BILL-'.str_pad((string) $payable->id, 6, '0', STR_PAD_LEFT);
        } elseif ($payable instanceof ServiceCharge) {
            $type = 'service_charge';
            $typeLabel = 'Service charge';
            $reference = 'SC-'.str_pad((string) $payable->id, 6, '0', STR_PAD_LEFT);
        }

        return [
            'id' => $payment->id,
            'payment_date' => $payment->payment_date?->toDateString(),
            'amount' => (float) $payment->amount,
            'payment_method' => (string) $payment->payment_method,
            'reference' => $reference,
            'type' => $type,
            'type_label' => $typeLabel,
            'customer_name' => $customer?->name,
            'account_number' => $customer?->account_number,
            'zone_name' => $customer?->zone?->name,
            'tariff_name' => $customer?->tariff?->name,
            'station_name' => $payment->station?->name,
            'recorder_name' => $payment->recorder?->name,
        ];
    }

    /**
     * @return array{
     *     month: string,
     *     from: string,
     *     to: string,
     *     zone_id: ?int,
     *     tariff_id: ?int,
     *     payment_type: string,
     *     recorded_by: ?int
     * }
     */
    private function validatedFilters(Request $request): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $request->validate([
            'month' => ['nullable', 'string', 'regex:/^(\d{4}-\d{2}|all)$/'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'payment_type' => ['nullable', 'string', 'in:bill,service_charge'],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'tariff_id' => ['nullable', 'integer', 'exists:tariffs,id'],
            'recorded_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $paymentType = $validated['payment_type'] ?? 'bill';
        if (! in_array($paymentType, ['bill', 'service_charge'], true)) {
            $paymentType = 'bill';
        }

        $monthInput = $validated['month'] ?? null;
        if (! is_string($monthInput) || $monthInput === '') {
            $legacyFrom = $validated['from'] ?? null;
            if (is_string($legacyFrom) && $legacyFrom !== '') {
                $monthInput = Carbon::parse($legacyFrom)->format('Y-m');
            } else {
                $monthInput = now()->format('Y-m');
            }
        }

        if ($monthInput === 'all') {
            $year = now()->year;
            $from = Carbon::createFromDate($year, 1, 1)->startOfDay()->toDateString();
            $to = Carbon::createFromDate($year, 12, 31)->endOfDay()->toDateString();
        } else {
            $monthStart = Carbon::createFromFormat('Y-m', $monthInput)->startOfMonth();
            $from = $monthStart->toDateString();
            $to = $monthStart->copy()->endOfMonth()->toDateString();
        }

        return [
            'month' => $monthInput,
            'from' => $from,
            'to' => $to,
            'payment_type' => $paymentType,
            'zone_id' => isset($validated['zone_id']) ? (int) $validated['zone_id'] : null,
            'tariff_id' => isset($validated['tariff_id']) ? (int) $validated['tariff_id'] : null,
            'recorded_by' => isset($validated['recorded_by']) ? (int) $validated['recorded_by'] : null,
        ];
    }
}
