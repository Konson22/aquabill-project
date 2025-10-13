<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Response;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $dateRange = $request->get('date_range', 'month');
        $startDate = $this->getDateRange($dateRange)['start'];
        $endDate = $this->getDateRange($dateRange)['end'];

        // Enhanced stats with date filtering
        $stats = $this->getEnhancedStats($startDate, $endDate);

        // Monthly revenue data for charts
        $monthlyRevenue = $this->getMonthlyRevenueData();

        // Payment method breakdown
        $paymentMethodData = $this->getPaymentMethodData($startDate, $endDate);

        // Recent bills with enhanced data
        $recentBills = $this->getRecentBills($startDate, $endDate);

        // Latest payments
        $latestPayments = $this->getLatestPayments($startDate, $endDate);

        // Overdue bills
        $overdueBills = $this->getOverdueBills();

        // Receivables aging data
        $receivablesAging = $this->getReceivablesAgingData();

        // Top debtors
        $topDebtors = $this->getTopDebtors();

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

        // Fetch all categories for filtering
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('finance/index', [
            'stats' => $stats,
            'allPayments' => $allPayments,
            'allInvoices' => $allInvoices,
            'allBills' => $allBills,
            'categories' => $categories,
            'monthlyRevenue' => $monthlyRevenue,
            'paymentMethodData' => $paymentMethodData,
            'recentBills' => $recentBills,
            'latestPayments' => $latestPayments,
            'overdueBills' => $overdueBills,
            'receivablesAging' => $receivablesAging,
            'topDebtors' => $topDebtors,
            'dateRange' => $dateRange,
        ]);
    }

    private function getDateRange($range)
    {
        $now = Carbon::now();
        
        switch ($range) {
            case 'today':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'week':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek()
                ];
            case 'month':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
            case 'quarter':
                return [
                    'start' => $now->copy()->startOfQuarter(),
                    'end' => $now->copy()->endOfQuarter()
                ];
            case 'year':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear()
                ];
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
        }
    }

    private function getEnhancedStats($startDate, $endDate)
    {
        // Total revenue (this period)
        $totalRevenue = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->sum('amount_paid');

        // Outstanding balance (unpaid bills + invoices)
        $outstandingBills = Bill::where('current_balance', '>', 0)->sum('current_balance');
        $outstandingInvoices = Invoice::where('status', '!=', 'paid')->sum('amount_due');
        $outstandingBalance = $outstandingBills + $outstandingInvoices;

        // Total bills issued (this period)
        $totalBillsIssued = Bill::whereBetween('created_at', [$startDate, $endDate])->count();

        // Pending payments (bills with current_balance > 0)
        $pendingPayments = Bill::where('current_balance', '>', 0)->count();

        // Collection rate
        $totalBilled = Bill::sum('total_amount');
        $totalCollected = Payment::sum('amount_paid');
        $collectionRate = $totalBilled > 0 ? ($totalCollected / $totalBilled) * 100 : 0;

        // This month's revenue
        $thisMonthStart = Carbon::now()->startOfMonth();
        $thisMonthEnd = Carbon::now()->endOfMonth();
        $thisMonthRevenue = Payment::whereBetween('payment_date', [$thisMonthStart, $thisMonthEnd])
            ->sum('amount_paid');

        return [
            'total_revenue' => (float) $totalRevenue,
            'outstanding_balance' => (float) $outstandingBalance,
            'total_bills_issued' => (int) $totalBillsIssued,
            'pending_payments' => (int) $pendingPayments,
            'collection_rate' => round($collectionRate, 2),
            'this_month_revenue' => (float) $thisMonthRevenue,
            'total_billed' => (float) $totalBilled,
            'total_collected' => (float) $totalCollected,
        ];
    }

    private function getMonthlyRevenueData()
    {
        $currentYear = Carbon::now()->year;
        
        $revenueData = Payment::selectRaw('MONTH(payment_date) as month, SUM(amount_paid) as revenue')
            ->whereYear('payment_date', $currentYear)
            ->whereNotNull('payment_date')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Create complete year array
        $completeYear = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthData = $revenueData->where('month', $month)->first();
            $completeYear[] = [
                'month' => Carbon::create()->month($month)->format('M'),
                'revenue' => $monthData ? (float) $monthData->revenue : 0.0
            ];
        }

        return $completeYear;
    }

    private function getPaymentMethodData($startDate, $endDate)
    {
        $paymentMethods = Payment::selectRaw('payment_method, SUM(amount_paid) as amount, COUNT(*) as count')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->groupBy('payment_method')
            ->get();

        return $paymentMethods->map(function ($method) {
            return [
                'method' => $method->payment_method,
                'amount' => (float) $method->amount,
                'count' => (int) $method->count
            ];
        })->toArray();
    }

    private function getRecentBills($startDate, $endDate)
    {
        return Bill::with(['customer'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'customer_name' => $bill->customer ? 
                        $bill->customer->first_name . ' ' . $bill->customer->last_name : 'Unknown',
                    'amount' => (float) $bill->total_amount,
                    'status' => $bill->current_balance <= 0 ? 'paid' : 'unpaid',
                    'due_date' => $bill->billing_period_end,
                    'created_at' => $bill->created_at
                ];
            });
    }

    private function getLatestPayments($startDate, $endDate)
    {
        return Payment::with(['customer', 'bill'])
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->latest('payment_date')
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'customer_name' => $payment->customer ? 
                        $payment->customer->first_name . ' ' . $payment->customer->last_name : 'Unknown',
                    'amount' => (float) $payment->amount_paid,
                    'method' => $payment->payment_method,
                    'status' => 'completed',
                    'payment_date' => $payment->payment_date,
                    'reference_number' => $payment->reference_number
                ];
            });
    }

    private function getOverdueBills()
    {
        $overdueDate = Carbon::now()->subDays(30);
        
        return Bill::with(['customer'])
            ->where('billing_period_end', '<', $overdueDate)
            ->where('current_balance', '>', 0)
            ->latest('billing_period_end')
            ->limit(10)
            ->get()
            ->map(function ($bill) {
                $daysOverdue = Carbon::parse($bill->billing_period_end)->diffInDays(Carbon::now());
                return [
                    'id' => $bill->id,
                    'customer_name' => $bill->customer ? 
                        $bill->customer->first_name . ' ' . $bill->customer->last_name : 'Unknown',
                    'amount' => (float) $bill->current_balance,
                    'due_date' => $bill->billing_period_end,
                    'days_overdue' => $daysOverdue
                ];
            });
    }

    private function getReceivablesAgingData()
    {
        $bills = Bill::with(['customer'])
            ->where('current_balance', '>', 0)
            ->get();

        return $bills->map(function ($bill) {
            $daysOverdue = Carbon::parse($bill->billing_period_end)->diffInDays(Carbon::now());
            return [
                'id' => $bill->id,
                'amount' => (float) $bill->current_balance,
                'daysOverdue' => $daysOverdue,
                'customer_name' => $bill->customer ? 
                    $bill->customer->first_name . ' ' . $bill->customer->last_name : 'Unknown'
            ];
        });
    }

    private function getTopDebtors()
    {
        return Bill::with(['customer'])
            ->select('customer_id', DB::raw('SUM(current_balance) as outstanding_amount'), DB::raw('COUNT(*) as bill_count'))
            ->where('current_balance', '>', 0)
            ->groupBy('customer_id')
            ->orderBy('outstanding_amount', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($debtor) {
                return [
                    'id' => $debtor->customer_id,
                    'customer_name' => $debtor->customer ? 
                        $debtor->customer->first_name . ' ' . $debtor->customer->last_name : 'Unknown',
                    'outstanding_amount' => (float) $debtor->outstanding_amount,
                    'bill_count' => (int) $debtor->bill_count
                ];
            });
    }

    public function export(Request $request)
    {
        $year = $request->get('year');
        $month = $request->get('month');
        $category = $request->get('category');

        // Build query for bills
        $billsQuery = Bill::with(['customer', 'customer.category']);
        if ($year) {
            $billsQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $billsQuery->whereMonth('created_at', $month);
        }
        if ($category) {
            $billsQuery->whereHas('customer.category', function($q) use ($category) {
                $q->where('id', $category);
            });
        }
        $bills = $billsQuery->get();

        // Build query for invoices
        $invoicesQuery = Invoice::with(['customer', 'customer.category']);
        if ($year) {
            $invoicesQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $invoicesQuery->whereMonth('created_at', $month);
        }
        if ($category) {
            $invoicesQuery->whereHas('customer.category', function($q) use ($category) {
                $q->where('id', $category);
            });
        }
        $invoices = $invoicesQuery->get();

        // Build query for payments
        $paymentsQuery = Payment::with(['customer', 'receivedBy']);
        if ($year) {
            $paymentsQuery->whereYear('payment_date', $year);
        }
        if ($month) {
            $paymentsQuery->whereMonth('payment_date', $month);
        }
        if ($category) {
            $paymentsQuery->whereHas('customer.category', function($q) use ($category) {
                $q->where('id', $category);
            });
        }
        $payments = $paymentsQuery->get();

        // Calculate summary statistics
        $totalRevenue = $invoices->sum('amount_due');
        $totalCollected = $payments->sum('amount_paid');
        $totalBills = $bills->count();
        $totalInvoices = $invoices->count();
        $totalPayments = $payments->count();
        $outstandingAmount = $bills->where('current_balance', '>', 0)->sum('current_balance') + 
                           $invoices->where('status', '!=', 'paid')->sum('amount_due');
        $collectionRate = $totalRevenue > 0 ? ($totalCollected / $totalRevenue) * 100 : 0;

        // Generate CSV content
        $csvContent = $this->generateCsvContent($bills, $invoices, $payments, [
            'totalRevenue' => $totalRevenue,
            'totalCollected' => $totalCollected,
            'totalBills' => $totalBills,
            'totalInvoices' => $totalInvoices,
            'totalPayments' => $totalPayments,
            'outstandingAmount' => $outstandingAmount,
            'collectionRate' => $collectionRate,
            'year' => $year,
            'month' => $month,
            'category' => $category,
        ]);

        $filename = 'finance_report_' . date('Y-m-d_H-i-s') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function generateCsvContent($bills, $invoices, $payments, $summary)
    {
        $csv = '';
        
        // Summary section
        $csv .= "FINANCE GENERAL REPORT\n";
        $csv .= "Generated on: " . date('Y-m-d H:i:s') . "\n";
        if ($summary['year']) {
            $csv .= "Year: " . $summary['year'] . "\n";
        }
        if ($summary['month']) {
            $csv .= "Month: " . $summary['month'] . "\n";
        }
        $csv .= "\n";
        
        $csv .= "SUMMARY STATISTICS\n";
        $csv .= "Total Revenue,Total Collected,Total Bills,Total Invoices,Total Payments,Outstanding Amount,Collection Rate\n";
        $csv .= $summary['totalRevenue'] . "," . $summary['totalCollected'] . "," . 
                $summary['totalBills'] . "," . $summary['totalInvoices'] . "," . 
                $summary['totalPayments'] . "," . $summary['outstandingAmount'] . "," . 
                round($summary['collectionRate'], 2) . "%\n\n";

        // Bills section
        $csv .= "BILLS\n";
        $csv .= "ID,Customer Name,Account Number,Category,Bill Period Start,Bill Period End,Total Amount,Current Balance,Status,Created At\n";
        foreach ($bills as $bill) {
            $csv .= $bill->id . ",";
            $csv .= '"' . ($bill->customer ? $bill->customer->first_name . ' ' . $bill->customer->last_name : 'N/A') . '",';
            $csv .= '"' . ($bill->customer ? $bill->customer->account_number : 'N/A') . '",';
            $csv .= '"' . ($bill->customer && $bill->customer->category ? $bill->customer->category->name : 'N/A') . '",';
            $csv .= $bill->billing_period_start . ",";
            $csv .= $bill->billing_period_end . ",";
            $csv .= $bill->total_amount . ",";
            $csv .= $bill->current_balance . ",";
            $csv .= $bill->status . ",";
            $csv .= $bill->created_at . "\n";
        }
        $csv .= "\n";

        // Invoices section
        $csv .= "INVOICES\n";
        $csv .= "ID,Customer Name,Account Number,Category,Invoice Number,Issue Date,Due Date,Amount Due,Status,Created At\n";
        foreach ($invoices as $invoice) {
            $csv .= $invoice->id . ",";
            $csv .= '"' . ($invoice->customer ? $invoice->customer->first_name . ' ' . $invoice->customer->last_name : 'N/A') . '",';
            $csv .= '"' . ($invoice->customer ? $invoice->customer->account_number : 'N/A') . '",';
            $csv .= '"' . ($invoice->customer && $invoice->customer->category ? $invoice->customer->category->name : 'N/A') . '",';
            $csv .= '"' . ($invoice->invoice_number ?: 'N/A') . '",';
            $csv .= $invoice->issue_date . ",";
            $csv .= $invoice->due_date . ",";
            $csv .= $invoice->amount_due . ",";
            $csv .= $invoice->status . ",";
            $csv .= $invoice->created_at . "\n";
        }
        $csv .= "\n";

        // Payments section
        $csv .= "PAYMENTS\n";
        $csv .= "ID,Customer Name,Account Number,Payment Date,Amount Paid,Payment Method,Reference Number,Received By,Created At\n";
        foreach ($payments as $payment) {
            $csv .= $payment->id . ",";
            $csv .= '"' . ($payment->customer ? $payment->customer->first_name . ' ' . $payment->customer->last_name : 'N/A') . '",';
            $csv .= '"' . ($payment->customer ? $payment->customer->account_number : 'N/A') . '",';
            $csv .= $payment->payment_date . ",";
            $csv .= $payment->amount_paid . ",";
            $csv .= $payment->payment_method . ",";
            $csv .= '"' . ($payment->reference_number ?: 'N/A') . '",';
            $csv .= '"' . ($payment->receivedBy ? $payment->receivedBy->name : 'N/A') . '",';
            $csv .= $payment->created_at . "\n";
        }

        return $csv;
    }
}


