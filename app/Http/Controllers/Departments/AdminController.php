<?php

namespace App\Http\Controllers\Departments;

use App\Http\Controllers\Controller;
use App\Models\Disconnection;
use App\Models\Payment;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * @return list<array{month: int, label: string, amount: float}>
     */
    private function monthlyPaymentChartData(int $year): array
    {
        $totals = array_fill(1, 12, 0.0);

        foreach (Payment::query()->whereYear('payment_date', $year)->get(['amount', 'payment_date']) as $payment) {
            $month = (int) $payment->payment_date->format('n');
            $totals[$month] += (float) $payment->amount;
        }

        $rows = [];
        for ($month = 1; $month <= 12; $month++) {
            $rows[] = [
                'month' => $month,
                'label' => Carbon::createFromDate($year, $month, 1)->format('M'),
                'amount' => round($totals[$month], 2),
            ];
        }

        return $rows;
    }

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

        $paymentChartYear = (int) now()->year;

        return Inertia::render('admin/dashboard', [
            'disconnectionStats' => Disconnection::summaryStats(),
            'notifiedCustomers' => $notifiedCustomers,
            'disconnectedCustomers' => $disconnectedCustomers,
            'monthlyPayments' => $this->monthlyPaymentChartData($paymentChartYear),
            'paymentChartYear' => $paymentChartYear,
        ]);
    }
}
