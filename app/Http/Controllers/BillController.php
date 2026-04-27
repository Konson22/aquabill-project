<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BillController extends Controller
{
    /**
     * Display a listing of bills.
     */
    public function index(Request $request): Response
    {
        $bills = Bill::with(['customer', 'meter'])
            ->latest()
            ->paginate(15);

        return Inertia::render('bills/index', [
            'bills' => $bills,
        ]);
    }

    /**
     * Display overdue unpaid bills (due_date has passed).
     */
    public function overdue(Request $request): Response
    {
        $today = Carbon::today();

        $bills = Bill::query()
            ->with(['customer', 'meter'])
            ->where('status', 'unpaid')
            ->whereDate('due_date', '<', $today)
            ->latest('due_date')
            ->paginate(15);

        return Inertia::render('bills/overdue-bills', [
            'bills' => $bills,
        ]);
    }

    /**
     * Display bills list for printing workflow.
     */
    public function printingList(): Response
    {
        $bills = Bill::with(['customer.zone', 'meter'])
            ->withSum('payments', 'amount')
            ->whereIn('status', ['unpaid', 'partial'])
            ->latest()
            ->get()
            ->map(function (Bill $bill) {
                $paidAmount = (float) ($bill->payments_sum_amount ?? 0);
                $totalAmount = (float) $bill->total_amount;
                $bill->current_balance = max(0, $totalAmount - $paidAmount);

                return $bill;
            });

        return Inertia::render('bills/bill-printing-list', [
            'bills' => $bills,
        ]);
    }

    /**
     * Display the specified bill.
     */
    public function show(Bill $bill): Response
    {
        $bill->load(['customer.zone', 'meter', 'reading']);

        return Inertia::render('bills/show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Display a printer-friendly version of the bill.
     */
    public function print(Bill $bill): Response
    {
        $bill->load(['customer.zone', 'meter', 'reading']);

        return Inertia::render('bills/print-single', [
            'bill' => $bill,
        ]);
    }

    /**
     * Display printer-friendly view for multiple selected bills.
     */
    public function bulkPrint(Request $request): Response
    {
        $ids = collect(explode(',', (string) $request->query('ids', '')))
            ->map(fn (string $id) => (int) trim($id))
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values();

        $bills = Bill::with(['customer.zone', 'meter', 'reading'])
            ->whereIn('id', $ids)
            ->orderBy('id')
            ->get();

        return Inertia::render('bills/print-multiple', [
            'bills' => $bills,
        ]);
    }
}
