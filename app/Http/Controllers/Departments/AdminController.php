<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Disconnection;
use App\Models\ServiceCharge;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        $notifiedCustomers = Disconnection::query()
            ->with(['customer:id,name,account_number'])
            ->where('status', 'notified')
            ->latest('notified_at')
            ->limit(10)
            ->get()
            ->map(fn (Disconnection $row): array => [
                'id' => $row->id,
                'customer_id' => $row->customer_id,
                'customer_name' => $row->customer?->name,
                'account_number' => $row->customer?->account_number,
                'notified_at' => $row->notified_at?->toDateString(),
                'notice_ends_at' => $row->notice_ends_at?->toDateString(),
            ]);

        $disconnectedCustomers = Disconnection::query()
            ->with(['customer:id,name,account_number'])
            ->where('status', 'disconnected')
            ->latest('disconnected_at')
            ->limit(10)
            ->get()
            ->map(fn (Disconnection $row): array => [
                'id' => $row->id,
                'customer_id' => $row->customer_id,
                'customer_name' => $row->customer?->name,
                'account_number' => $row->customer?->account_number,
                'disconnected_at' => $row->disconnected_at?->toDateString(),
                'disconnection_type' => $row->disconnection_type,
            ]);

        $paidBillsCount = Bill::query()->where('status', 'paid')->count();
        $unpaidBillsCount = Bill::query()->whereIn('status', ['pending', 'partial', 'forwarded'])->count();

        $billTotals = Bill::query()
            ->selectRaw('COALESCE(SUM(current_charge + fixed_charge), 0) as total_billed, COALESCE(SUM(amount_paid), 0) as paid_on_bills')
            ->first();
        $totalBilledRevenue = (float) ($billTotals->total_billed ?? 0);
        $totalPaidOnBills = (float) ($billTotals->paid_on_bills ?? 0);
        $paidServiceCharges = (float) ServiceCharge::query()->where('status', 'paid')->sum('amount');
        $actualTotalPaid = $totalPaidOnBills + $paidServiceCharges;
        $collectionRatePercent = $totalBilledRevenue > 0.00001
            ? round(($actualTotalPaid / $totalBilledRevenue) * 100, 1)
            : 0.0;

        return Inertia::render('admin/dashboard', [
            'disconnectionStats' => Disconnection::summaryStats(),
            'notifiedCustomers' => $notifiedCustomers,
            'disconnectedCustomers' => $disconnectedCustomers,
            'revenueBillCounts' => [
                'paid' => $paidBillsCount,
                'unpaid' => $unpaidBillsCount,
                'total' => $paidBillsCount + $unpaidBillsCount,
                'collection_rate_percent' => $collectionRatePercent,
            ],
        ]);
    }
}
