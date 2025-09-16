<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Invoice;

class FinanceController extends Controller
{
    public function index()
    {
        $stats = [
            'total_billed' => (float) (Bill::sum('total_amount') ?? 0),
            'total_prev_balance' => (float) (Bill::sum('prev_balance') ?? 0),
            'total_collected' => (float) (Payment::sum('amount_paid') ?? 0),
            'total_outstanding' => (float) (Bill::sum('current_balance') ?? 0),
            'total_invoiced' => (float) (Invoice::sum('amount_due') ?? 0),
            'total_invoices' => (int) (Invoice::count() ?? 0),
            'paid_invoices' => (int) (Invoice::where('status', 'paid')->count() ?? 0),
            'unpaid_invoices' => (int) (Invoice::where('status', '!=', 'paid')->count() ?? 0),
        ];

        // Fetch all payments with relationships for the tabbed interface
        $allPayments = Payment::with(['customer', 'bill', 'receivedBy'])
            ->latest('payment_date')
            ->paginate(20);

        // Fetch all invoices with relationships for the tabbed interface
        $allInvoices = Invoice::with(['customer', 'payments'])
            ->latest('issue_date')
            ->paginate(20);

        // Fetch all bills with relationships for the tabbed interface
        $allBills = Bill::with(['customer'])
            ->latest('billing_period_end')
            ->paginate(20);

        return Inertia::render('finance/index', [
            'stats' => $stats,
            'allPayments' => $allPayments,
            'allInvoices' => $allInvoices,
            'allBills' => $allBills,
        ]);
    }
}


