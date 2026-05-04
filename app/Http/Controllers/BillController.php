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
            ->whereIn('status', ['pending', 'partial'])
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
            ->whereIn('status', ['pending', 'partial'])
            ->latest()
            ->get();

        return Inertia::render('bills/bill-printing-list', [
            'bills' => $bills,
        ]);
    }

    /**
     * Display the specified bill.
     */
    public function show(Bill $bill): Response
    {
        $bill->load(['customer.zone', 'customer.tariff', 'meter', 'reading']);

        return Inertia::render('bills/show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Display a printer-friendly version of the bill.
     */
    public function print(Bill $bill): Response
    {
        $bill->load(['customer.zone', 'customer.tariff', 'meter', 'reading']);

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

        $bills = Bill::with(['customer.zone', 'customer.tariff', 'meter', 'reading'])
            ->whereIn('id', $ids)
            ->orderBy('id')
            ->get();

        return Inertia::render('bills/print-multiple', [
            'bills' => $bills,
        ]);
    }
}
