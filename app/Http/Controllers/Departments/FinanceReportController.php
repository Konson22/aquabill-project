<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\ServiceCharge;
use App\Models\Tariff;
use App\Models\User;
use App\Models\Zone;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->validatedFilters($request);

        $billPaymentsQuery = Bill::query()
            ->with(['customer.zone', 'customer.tariff'])
            ->withSum('payments', 'amount');
        $this->applyBillScopeFilters($billPaymentsQuery, $filters);
        $billPaymentsQuery->whereHas('payments', function (Builder $pq) use ($filters): void {
            $pq->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('payment_date', '>=', $from))
                ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('payment_date', '<=', $to));
        });

        $serviceChargePaymentsQuery = ServiceCharge::query()
            ->with(['customer.zone', 'customer.tariff', 'issuer'])
            ->where('status', 'paid');
        $this->applyServiceChargeFilters($serviceChargePaymentsQuery, $filters);

        $billPayments = (clone $billPaymentsQuery)
            ->orderByDesc('updated_at')
            ->limit(500)
            ->get()
            ->map(function (Bill $bill): array {
                return [
                    'date' => $bill->updated_at?->toDateString(),
                    'type' => 'bill',
                    'reference' => $bill->bill_no,
                    'customer_name' => $bill->customer?->name,
                    'account_number' => $bill->customer?->account_number,
                    'zone_name' => $bill->customer?->zone?->name,
                    'tariff_name' => $bill->customer?->tariff?->name,
                    'cashier_name' => null,
                    'amount' => (float) $bill->paidTotalFloat(),
                ];
            });

        $serviceChargePayments = (clone $serviceChargePaymentsQuery)
            ->orderByDesc('issued_date')
            ->limit(500)
            ->get()
            ->map(function (ServiceCharge $charge): array {
                return [
                    'date' => $charge->issued_date?->toDateString(),
                    'type' => 'service_charge',
                    'reference' => 'SC-'.str_pad((string) $charge->id, 6, '0', STR_PAD_LEFT),
                    'customer_name' => $charge->customer?->name,
                    'account_number' => $charge->customer?->account_number,
                    'zone_name' => $charge->customer?->zone?->name,
                    'tariff_name' => $charge->customer?->tariff?->name,
                    'cashier_name' => $charge->issuer?->name,
                    'amount' => (float) $charge->amount,
                ];
            });

        $payments = $billPayments
            ->concat($serviceChargePayments)
            ->sortByDesc('date')
            ->values()
            ->all();

        $totalRevenueCollected = (float) Payment::query()
            ->where('payable_type', Bill::class)
            ->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('payment_date', '>=', $from))
            ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('payment_date', '<=', $to))
            ->whereHasMorph('payable', [Bill::class], fn (Builder $bq) => $this->applyBillScopeFilters($bq, $filters))
            ->sum('amount')
            + (float) (clone $serviceChargePaymentsQuery)->sum('amount');

        $outstandingBillsQuery = Bill::query()
            ->whereIn('status', ['pending', 'partial']);
        $this->applyBillScopeFilters($outstandingBillsQuery, $filters);
        $outstandingBills = (float) $outstandingBillsQuery
            ->withSum('payments', 'amount')
            ->get()
            ->sum(fn (Bill $bill): float => max(0.0, (float) $bill->total_amount - (float) ($bill->payments_sum_amount ?? 0)));

        $overdueBillsQuery = Bill::query()
            ->whereIn('status', ['pending', 'partial'])
            ->whereDate('due_date', '<', Carbon::today()->toDateString());
        $this->applyBillScopeFilters($overdueBillsQuery, $filters);
        $overdueBills = (int) $overdueBillsQuery->count();

        $monthlyCollectionSummary = $this->buildMonthlyCollectionSummary($filters);
        $zoneRevenueComparison = $this->buildZoneRevenueComparison($filters);

        return inertia('finance/reports/index', [
            'summary' => [
                'total_revenue_collected' => $totalRevenueCollected,
                'outstanding_bills' => $outstandingBills,
                'overdue_bills' => $overdueBills,
                'payments_count' => count($payments),
            ],
            'monthlyCollectionSummary' => $monthlyCollectionSummary,
            'zoneRevenueComparison' => $zoneRevenueComparison,
            'payments' => $payments,
            'filters' => $filters,
            'filterOptions' => [
                'zones' => Zone::query()->orderBy('name')->get(['id', 'name']),
                'tariffs' => Tariff::query()->orderBy('name')->get(['id', 'name']),
                'customers' => Customer::query()->orderBy('name')->limit(300)->get(['id', 'name', 'account_number']),
                'cashiers' => User::query()->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validatedFilters($request);

        $billPaymentsQuery = Bill::query()
            ->with(['customer.zone', 'customer.tariff'])
            ->withSum('payments', 'amount');
        $this->applyBillScopeFilters($billPaymentsQuery, $filters);
        $billPaymentsQuery->whereHas('payments', function (Builder $pq) use ($filters): void {
            $pq->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('payment_date', '>=', $from))
                ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('payment_date', '<=', $to));
        });

        $serviceChargePaymentsQuery = ServiceCharge::query()
            ->with(['customer.zone', 'customer.tariff', 'issuer'])
            ->where('status', 'paid');
        $this->applyServiceChargeFilters($serviceChargePaymentsQuery, $filters);

        $rows = [];
        foreach ((clone $billPaymentsQuery)->orderByDesc('updated_at')->get() as $bill) {
            $rows[] = [
                $bill->updated_at?->toDateString(),
                'Bill Payment',
                $bill->bill_no,
                $bill->customer?->name,
                $bill->customer?->account_number,
                $bill->customer?->zone?->name,
                $bill->customer?->tariff?->name,
                'N/A',
                (float) $bill->paidTotalFloat(),
            ];
        }

        foreach ((clone $serviceChargePaymentsQuery)->orderByDesc('issued_date')->get() as $charge) {
            $rows[] = [
                $charge->issued_date?->toDateString(),
                'Service Charge Payment',
                'SC-'.str_pad((string) $charge->id, 6, '0', STR_PAD_LEFT),
                $charge->customer?->name,
                $charge->customer?->account_number,
                $charge->customer?->zone?->name,
                $charge->customer?->tariff?->name,
                $charge->issuer?->name ?? 'N/A',
                (float) $charge->amount,
            ];
        }

        usort($rows, fn (array $a, array $b): int => strcmp((string) $b[0], (string) $a[0]));

        $filename = 'finance_revenue_report_'.now()->format('Ymd_His').'.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-store, no-cache',
        ];

        return response()->stream(function () use ($rows, $filters): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Finance Revenue Report']);
            fputcsv($out, ['From', $filters['from'] ?? '']);
            fputcsv($out, ['To', $filters['to'] ?? '']);
            fputcsv($out, []);
            fputcsv($out, ['Date', 'Type', 'Reference', 'Customer', 'Account', 'Zone', 'Tariff', 'Cashier', 'Amount']);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, 200, $headers);
    }

    /**
     * @return array{
     *     from: ?string,
     *     to: ?string,
     *     zone_id: ?int,
     *     tariff_id: ?int,
     *     customer_id: ?int,
     *     cashier_id: ?int
     * }
     */
    private function validatedFilters(Request $request): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'tariff_id' => ['nullable', 'integer', 'exists:tariffs,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'cashier_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return [
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
            'zone_id' => isset($validated['zone_id']) ? (int) $validated['zone_id'] : null,
            'tariff_id' => isset($validated['tariff_id']) ? (int) $validated['tariff_id'] : null,
            'customer_id' => isset($validated['customer_id']) ? (int) $validated['customer_id'] : null,
            'cashier_id' => isset($validated['cashier_id']) ? (int) $validated['cashier_id'] : null,
        ];
    }

    /**
     * @param  Builder<Bill>  $query
     * @param  array<string, int|string|null>  $filters
     */
    private function applyBillScopeFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['zone_id'], function (Builder $q, int $zoneId): void {
                $q->whereHas('customer', fn (Builder $c) => $c->where('zone_id', $zoneId));
            })
            ->when($filters['tariff_id'], function (Builder $q, int $tariffId): void {
                $q->whereHas('customer', fn (Builder $c) => $c->where('tariff_id', $tariffId));
            })
            ->when($filters['customer_id'], fn (Builder $q, int $customerId) => $q->where('customer_id', $customerId));
    }

    /**
     * @param  Builder<ServiceCharge>  $query
     * @param  array<string, int|string|null>  $filters
     */
    private function applyServiceChargeFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('issued_date', '>=', $from))
            ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('issued_date', '<=', $to))
            ->when($filters['zone_id'], function (Builder $q, int $zoneId): void {
                $q->whereHas('customer', fn (Builder $c) => $c->where('zone_id', $zoneId));
            })
            ->when($filters['tariff_id'], function (Builder $q, int $tariffId): void {
                $q->whereHas('customer', fn (Builder $c) => $c->where('tariff_id', $tariffId));
            })
            ->when($filters['customer_id'], fn (Builder $q, int $customerId) => $q->where('customer_id', $customerId))
            ->when($filters['cashier_id'], fn (Builder $q, int $cashierId) => $q->where('issued_by', $cashierId));
    }

    /**
     * @param  array<string, int|string|null>  $filters
     * @return list<array{month: string, collected: float}>
     */
    private function buildMonthlyCollectionSummary(array $filters): array
    {
        $series = [];
        $start = now()->startOfMonth()->subMonths(5);
        for ($i = 0; $i < 6; $i++) {
            $monthStart = $start->copy()->addMonths($i);
            $monthEnd = $monthStart->copy()->endOfMonth();
            $monthLabel = $monthStart->format('M Y');

            $billQuery = Payment::query()
                ->where('payable_type', Bill::class)
                ->whereDate('payment_date', '>=', $monthStart->toDateString())
                ->whereDate('payment_date', '<=', $monthEnd->toDateString())
                ->whereHasMorph('payable', [Bill::class], function (Builder $bq) use ($filters): void {
                    $this->applyBillScopeFilters($bq, $filters);
                });

            $chargeQuery = ServiceCharge::query()
                ->where('status', 'paid')
                ->whereDate('issued_date', '>=', $monthStart->toDateString())
                ->whereDate('issued_date', '<=', $monthEnd->toDateString());
            $this->applyServiceChargeFilters($chargeQuery, [
                ...$filters,
                'from' => null,
                'to' => null,
            ]);

            $series[] = [
                'month' => $monthLabel,
                'collected' => (float) $billQuery->sum('amount') + (float) $chargeQuery->sum('amount'),
            ];
        }

        return $series;
    }

    /**
     * @param  array<string, int|string|null>  $filters
     * @return list<array{zone: string, collected: float}>
     */
    private function buildZoneRevenueComparison(array $filters): array
    {
        $zones = Zone::query()->orderBy('name')->get(['id', 'name']);

        return $zones->map(function (Zone $zone) use ($filters): array {
            $billCollected = (float) Payment::query()
                ->where('payable_type', Bill::class)
                ->whereHasMorph('payable', [Bill::class], function (Builder $bq) use ($zone, $filters): void {
                    $bq->whereHas('customer', fn (Builder $c) => $c->where('zone_id', $zone->id));
                    $this->applyBillScopeFilters($bq, $filters);
                })
                ->when($filters['from'], fn (Builder $q, string $from) => $q->whereDate('payment_date', '>=', $from))
                ->when($filters['to'], fn (Builder $q, string $to) => $q->whereDate('payment_date', '<=', $to))
                ->sum('amount');

            $chargeQuery = ServiceCharge::query()
                ->where('status', 'paid')
                ->whereHas('customer', fn (Builder $q) => $q->where('zone_id', $zone->id));
            $this->applyServiceChargeFilters($chargeQuery, $filters);

            return [
                'zone' => $zone->name,
                'collected' => $billCollected + (float) $chargeQuery->sum('amount'),
            ];
        })->values()->all();
    }
}
