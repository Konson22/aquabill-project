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
        $search = trim((string) $request->input('search', ''));

        $bills = Bill::query()
            ->with(['customer.zone', 'meter'])
            ->withSum('payments', 'amount')
            ->when($search !== '', function ($query) use ($search): void {
                $pattern = '%'.addcslashes($search, '%_\\').'%';
                $query->where(function ($q) use ($pattern): void {
                    $q->where('bills.bill_no', 'like', $pattern)
                        ->orWhere('bills.meter_number', 'like', $pattern)
                        ->orWhereHas('customer', function ($cq) use ($pattern): void {
                            $cq->where('name', 'like', $pattern)
                                ->orWhere('phone', 'like', $pattern);
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
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('bills/index', [
            'bills' => $bills,
            'filters' => [
                'search' => $search,
            ],
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
            ->withSum('payments', 'amount')
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
            ->withSum('payments', 'amount')
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
        $bill->load([
            'customer.zone', 'customer.tariff', 'meter', 'reading',
        ]);
        $bill->loadSum('payments', 'amount');

        return Inertia::render('bills/show', [
            'bill' => $bill,
        ]);
    }

    /**
     * Display a printer-friendly version of the bill.
     */
    public function print(Bill $bill): Response
    {
        $bill->load([
            'customer.zone', 'customer.tariff', 'meter', 'reading',
        ]);
        $bill->loadSum('payments', 'amount');

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
            ->withSum('payments', 'amount')
            ->whereIn('id', $ids)
            ->orderBy('id')
            ->get();

        return Inertia::render('bills/print-multiple', [
            'bills' => $bills,
        ]);
    }
}
