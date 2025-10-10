import RevenueTrendChart from '@/components/charts/RevenueTrendChart';
import DateRangeFilter from '@/components/finance/DateRangeFilter';
import MetricCard from '@/components/finance/MetricCard';
import ReceivablesAging from '@/components/finance/ReceivablesAging';
import TopDebtors from '@/components/finance/TopDebtors';
import InvoicePaymentFormModal from '@/components/payments/InvoicePaymentFormModal';
import PaymentFormModal from '@/components/payments/PaymentFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Filter,
    Printer,
    Receipt,
    Search,
    Smartphone,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [{ title: 'Finance', href: '/finance' }];

export default function FinanceIndex({
    stats,
    allPayments,
    allInvoices,
    allBills = [],
    monthlyRevenue = [],
    paymentMethodData = [],
    recentBills = [],
    latestPayments = [],
    overdueBills = [],
    receivablesAging = [],
    topDebtors = [],
    dateRange = 'month',
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchPayments, setSearchPayments] = useState('');
    const [searchInvoices, setSearchInvoices] = useState('');
    const [searchBills, setSearchBills] = useState('');
    const [currentDateRange, setCurrentDateRange] = useState(dateRange);

    // Payment modal states
    const [billPaymentModalOpen, setBillPaymentModalOpen] = useState(false);
    const [invoicePaymentModalOpen, setInvoicePaymentModalOpen] = useState(false);
    const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
    const [billPaymentDefaults, setBillPaymentDefaults] = useState({});
    const [invoicePaymentDefaults, setInvoicePaymentDefaults] = useState({});

    // Handle date range change
    const handleDateRangeChange = (newRange) => {
        setCurrentDateRange(newRange);
        router.get('/finance', { date_range: newRange }, { preserveState: true });
    };

    // Export to Excel function
    const exportToExcel = (data, filename, summary = null) => {
        let csvContent = [
            // Headers
            Object.keys(data[0] || {}).join(','),
            // Data rows
            ...data.map((row) =>
                Object.values(row)
                    .map((value) => `"${value}"`)
                    .join(','),
            ),
        ];

        // Add summary section if provided
        if (summary) {
            csvContent.push(''); // Empty line
            csvContent.push('SUMMARY'); // Summary header
            csvContent.push('Metric,Value'); // Summary headers
            Object.entries(summary).forEach(([key, value]) => {
                csvContent.push(`"${key}","${value}"`);
            });
        }

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get payment details for an invoice
    const getInvoicePaymentDetails = (invoiceId, invoiceAmount = 0) => {
        if (!allPayments?.data) return { amountPaid: 0, balance: invoiceAmount, paymentDate: '—' };

        const payments = allPayments.data.filter((payment) => payment.invoice_id === invoiceId);
        const totalPaid = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount_paid) || 0), 0);
        const latestPayment = payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        return {
            amountPaid: totalPaid,
            balance: invoiceAmount - totalPaid,
            paymentDate: latestPayment
                ? new Date(latestPayment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                  })
                : '—',
        };
    };

    // Print function
    const printTable = (title) => {
        const printWindow = window.open('', '_blank');
        const tableElement = document.querySelector(`[data-print="${title.toLowerCase()}"]`);

        if (tableElement) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            h1 { color: #333; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        ${tableElement.outerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Filter functions
    const filterPayments = (payments) => {
        if (!searchPayments) return payments;
        return payments.filter(
            (payment) =>
                (payment.customer?.first_name + ' ' + payment.customer?.last_name).toLowerCase().includes(searchPayments.toLowerCase()) ||
                payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                payment.reference_number?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                payment.amount_paid?.toString().includes(searchPayments),
        );
    };

    const filterInvoices = (invoices) => {
        let filtered = invoices;

        // Show only unpaid invoices by default
        filtered = filtered.filter((invoice) => invoice.status !== 'paid');

        // Apply search filter
        if (searchInvoices) {
            filtered = filtered.filter(
                (invoice) =>
                    (invoice.customer?.first_name + ' ' + invoice.customer?.last_name).toLowerCase().includes(searchInvoices.toLowerCase()) ||
                    invoice.invoice_number?.toLowerCase().includes(searchInvoices.toLowerCase()) ||
                    invoice.reason?.toLowerCase().includes(searchInvoices.toLowerCase()) ||
                    invoice.status?.toLowerCase().includes(searchInvoices.toLowerCase()) ||
                    invoice.amount_due?.toString().includes(searchInvoices),
            );
        }

        return filtered;
    };

    const filterBills = (bills) => {
        let filtered = bills;

        // Show only unpaid bills by default
        filtered = filtered.filter((bill) => bill.current_balance > 0);

        // Apply search filter
        if (searchBills) {
            filtered = filtered.filter(
                (bill) =>
                    (bill.customer?.first_name + ' ' + bill.customer?.last_name).toLowerCase().includes(searchBills.toLowerCase()) ||
                    bill.id?.toString().includes(searchBills) ||
                    bill.total_amount?.toString().includes(searchBills),
            );
        }

        return filtered;
    };

    // Payment handlers
    const handleBillPayment = (bill) => {
        setSelectedBillForPayment(bill);
        setBillPaymentDefaults({
            bill_id: bill.id,
            customer_id: bill.customer?.id || '',
            customer_name: bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '',
            prev_balance: bill.prev_balance || 0,
            total_amount: bill.total_amount || 0,
            amount: bill.current_balance || bill.total_amount || '',
            tariff: bill.customer?.category?.tariff || '',
            fixed_charge: bill.customer?.category?.fixed_charge || '',
            illigal_connection: bill.reading?.illigal_connection || 0,
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
        });
        setBillPaymentModalOpen(true);
    };

    const handleInvoicePayment = (invoice) => {
        setSelectedInvoiceForPayment(invoice);
        setInvoicePaymentDefaults({
            invoice_id: invoice.id,
            customer_id: invoice.customer_id,
            customer_name: invoice.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : 'N/A',
            amount: invoice.amount_due,
            due_date: invoice.due_date,
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
        });
        setInvoicePaymentModalOpen(true);
    };

    const submitBillPayment = (data) => {
        const payload = {
            bill_id: data.bill_id,
            customer_id: data.customer_id,
            payment_date: data.date,
            amount_paid: data.amount,
            payment_method: data.method,
            reference_number: data.reference_number || 'N/A',
        };

        return new Promise((resolve) => {
            router.post('/payments', payload, {
                onSuccess: () => {
                    setBillPaymentModalOpen(false);
                    setSelectedBillForPayment(null);
                    router.reload();
                    resolve();
                },
                onError: (errors) => {
                    console.error('Payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };

    const submitInvoicePayment = async (data) => {
        try {
            await router.post('/payments/invoice', {
                invoice_id: data.invoice_id,
                customer_id: data.customer_id,
                amount_paid: data.amount,
                payment_method: data.method,
                payment_date: data.date,
                reference_number: data.reference_number,
            });
            setInvoicePaymentModalOpen(false);
            setSelectedInvoiceForPayment(null);
            router.reload();
        } catch (error) {
            console.error('Invoice payment submission error:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance Dashboard" />

            {/* Header Section */}
            <div className="mb-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Finance Dashboard</h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Comprehensive overview of billing, invoicing, and payment management
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 sm:mt-0">
                        <DateRangeFilter value={currentDateRange} onChange={handleDateRangeChange} />
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Export all financial data to Excel
                                const exportData = {
                                    stats: stats,
                                    recentBills: recentBills,
                                    latestPayments: latestPayments,
                                    overdueBills: overdueBills,
                                    topDebtors: topDebtors,
                                    receivablesAging: receivablesAging,
                                    monthlyRevenue: monthlyRevenue,
                                    paymentMethodData: paymentMethodData,
                                };

                                // Create a comprehensive summary
                                const summary = {
                                    'Export Date': new Date().toLocaleDateString(),
                                    'Date Range': currentDateRange,
                                    'Total Revenue': formatSSPCurrency(stats?.total_revenue || 0),
                                    'Outstanding Balance': formatSSPCurrency(stats?.outstanding_balance || 0),
                                    'Total Bills Issued': stats?.total_bills_issued || 0,
                                    'Collection Rate': `${stats?.collection_rate || 0}%`,
                                    'Recent Bills Count': recentBills.length,
                                    'Latest Payments Count': latestPayments.length,
                                    'Overdue Bills Count': overdueBills.length,
                                    'Top Debtors Count': topDebtors.length,
                                };

                                // Convert to CSV format
                                const csvContent = [
                                    // Summary section
                                    'FINANCE DASHBOARD EXPORT',
                                    'Generated on: ' + new Date().toLocaleString(),
                                    '',
                                    'SUMMARY',
                                    Object.keys(summary).join(','),
                                    Object.values(summary)
                                        .map((value) => `"${value}"`)
                                        .join(','),
                                    '',
                                    // Recent Bills
                                    'RECENT BILLS',
                                    'Bill ID,Customer,Amount,Status,Due Date',
                                    ...recentBills.map((bill) =>
                                        [
                                            bill.id,
                                            bill.customer_name,
                                            formatSSPCurrency(bill.amount),
                                            bill.status,
                                            bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A',
                                        ]
                                            .map((value) => `"${value}"`)
                                            .join(','),
                                    ),
                                    '',
                                    // Latest Payments
                                    'LATEST PAYMENTS',
                                    'Payment ID,Customer,Amount,Method,Date',
                                    ...latestPayments.map((payment) =>
                                        [
                                            payment.id,
                                            payment.customer_name,
                                            formatSSPCurrency(payment.amount),
                                            payment.method,
                                            payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A',
                                        ]
                                            .map((value) => `"${value}"`)
                                            .join(','),
                                    ),
                                    '',
                                    // Overdue Bills
                                    'OVERDUE BILLS',
                                    'Bill ID,Customer,Amount,Days Overdue',
                                    ...overdueBills.map((bill) =>
                                        [bill.id, bill.customer_name, formatSSPCurrency(bill.amount), bill.days_overdue]
                                            .map((value) => `"${value}"`)
                                            .join(','),
                                    ),
                                    '',
                                    // Top Debtors
                                    'TOP DEBTORS',
                                    'Customer,Outstanding Amount,Bill Count',
                                    ...topDebtors.map((debtor) =>
                                        [debtor.customer_name, formatSSPCurrency(debtor.outstanding_amount), debtor.bill_count]
                                            .map((value) => `"${value}"`)
                                            .join(','),
                                    ),
                                    '',
                                    // Receivables Aging
                                    'RECEIVABLES AGING',
                                    'Days Overdue,Amount,Count',
                                    ...receivablesAging
                                        .reduce((acc, item) => {
                                            const bucket = item.daysOverdue <= 30 ? '0-30' : item.daysOverdue <= 60 ? '31-60' : '61+';
                                            const existing = acc.find((b) => b.bucket === bucket);
                                            if (existing) {
                                                existing.amount += item.amount;
                                                existing.count += 1;
                                            } else {
                                                acc.push({ bucket, amount: item.amount, count: 1 });
                                            }
                                            return acc;
                                        }, [])
                                        .map((bucket) =>
                                            [bucket.bucket, formatSSPCurrency(bucket.amount), bucket.count].map((value) => `"${value}"`).join(','),
                                        ),
                                    '',
                                    // Monthly Revenue
                                    'MONTHLY REVENUE',
                                    'Month,Revenue',
                                    ...monthlyRevenue.map((item) =>
                                        [item.month, formatSSPCurrency(item.revenue)].map((value) => `"${value}"`).join(','),
                                    ),
                                    '',
                                    // Payment Methods
                                    'PAYMENT METHODS',
                                    'Method,Amount,Count',
                                    ...paymentMethodData.map((item) =>
                                        [item.method, formatSSPCurrency(item.amount), item.count].map((value) => `"${value}"`).join(','),
                                    ),
                                ].join('\n');

                                // Download the file
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `finance-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Bills Button */}
                    <Button
                        asChild
                        className="h-auto bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                    >
                        <Link href="/billing" className="flex w-full items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-lg bg-white/20 p-3">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold">Bills Management</h3>
                                    <p className="text-sm text-blue-100">Manage customer bills and billing cycles</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/80" />
                        </Link>
                    </Button>

                    {/* Invoices Button */}
                    <Button
                        asChild
                        className="h-auto bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                    >
                        <Link href="/invoices" className="flex w-full items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-lg bg-white/20 p-3">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold">Invoice System</h3>
                                    <p className="text-sm text-green-100">Create and track service invoices</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/80" />
                        </Link>
                    </Button>

                    {/* Payments Button */}
                    <Button
                        asChild
                        className="h-auto bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
                    >
                        <Link href="/payments" className="flex w-full items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="rounded-lg bg-white/20 p-3">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-semibold">Payment Processing</h3>
                                    <p className="text-sm text-purple-100">Record and track payments</p>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-white/80" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="mb-8">
                <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={formatSSPCurrency(stats?.total_revenue || 0)}
                        subtitle={`This ${currentDateRange}`}
                        icon={DollarSign}
                        color="green"
                        trend="up"
                        trendValue="+12.5%"
                    />
                    <MetricCard
                        title="Outstanding Balance"
                        value={formatSSPCurrency(stats?.outstanding_balance || 0)}
                        subtitle="Unpaid bills & invoices"
                        icon={AlertTriangle}
                        color="red"
                        trend="down"
                        trendValue="-5.2%"
                    />
                    <MetricCard
                        title="Total Bills Issued"
                        value={stats?.total_bills_issued || 0}
                        subtitle={`This ${currentDateRange}`}
                        icon={FileText}
                        color="blue"
                        trend="up"
                        trendValue="+8.1%"
                    />
                    <MetricCard
                        title="Collection Rate"
                        value={`${stats?.collection_rate || 0}%`}
                        subtitle="Payment efficiency"
                        icon={TrendingUp}
                        color="purple"
                        trend="up"
                        trendValue="+2.3%"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
                <h2 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Analytics</h2>
                <div className="grid grid-cols-1 gap-6">
                    <RevenueTrendChart data={monthlyRevenue} type="area" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left Column - Tables */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Recent Bills Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Recent Bills
                                    </CardTitle>
                                    <CardDescription>Latest bills issued</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Bill #</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBills.length > 0 ? (
                                            recentBills.map((bill) => (
                                                <tr
                                                    key={bill.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                                >
                                                    <td className="px-4 py-3 text-sm">
                                                        <Link href={`/billing/${bill.id}`} className="text-blue-600 hover:underline">
                                                            #{bill.id}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{bill.customer_name}</td>
                                                    <td className="px-4 py-3 text-sm font-medium">{formatSSPCurrency(bill.amount)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                bill.status === 'paid'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                            }`}
                                                        >
                                                            {bill.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '—'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                                                    No recent bills found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Latest Payments Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Latest Payments
                                    </CardTitle>
                                    <CardDescription>Recent payment transactions</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Payment #</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestPayments.length > 0 ? (
                                            latestPayments.map((payment) => (
                                                <tr
                                                    key={payment.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                                >
                                                    <td className="px-4 py-3 text-sm">#{payment.id}</td>
                                                    <td className="px-4 py-3 text-sm">{payment.customer_name}</td>
                                                    <td className="px-4 py-3 text-sm font-medium">{formatSSPCurrency(payment.amount)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                payment.method === 'cash'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : payment.method === 'mobile_money'
                                                                      ? 'bg-orange-100 text-orange-800'
                                                                      : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                        >
                                                            {payment.method.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-8 text-center text-gray-500" colSpan={5}>
                                                    No recent payments found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Overdue Bills Widget */}
                    {overdueBills.length > 0 && (
                        <Card className="border-red-200 dark:border-red-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    Overdue Bills
                                </CardTitle>
                                <CardDescription>Bills requiring immediate attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {overdueBills.slice(0, 5).map((bill) => (
                                        <div
                                            key={bill.id}
                                            className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
                                        >
                                            <div>
                                                <p className="font-medium text-red-900 dark:text-red-100">#{bill.id}</p>
                                                <p className="text-sm text-red-700 dark:text-red-300">{bill.customer_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-900 dark:text-red-100">{formatSSPCurrency(bill.amount)}</p>
                                                <p className="text-xs text-red-700 dark:text-red-300">{bill.days_overdue} days overdue</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Analytics */}
                <div className="space-y-6">
                    <ReceivablesAging data={receivablesAging} />
                    <TopDebtors data={topDebtors} />
                </div>
            </div>

            {/* Legacy Tabbed Interface - Hidden by default, can be toggled */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Detailed Records</CardTitle>
                    <CardDescription>Comprehensive view of all financial records</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="bills" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Bills
                            </TabsTrigger>
                            <TabsTrigger value="invoices" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Invoices
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-6">
                            <div className="py-8 text-center">
                                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard Overview</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    The main dashboard above provides a comprehensive view of your financial data.
                                </p>
                            </div>
                        </TabsContent>

                        {/* Bills Tab */}
                        <TabsContent value="bills" className="mt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">All Bills</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const filteredBills = filterBills(allBills?.data || []);
                                                const billsData = filteredBills.map((bill) => {
                                                    const totalSum = Number(bill.total_amount);
                                                    const paid = Number(bill?.payment?.amount_paid || 0);
                                                    const balance = totalSum - paid;

                                                    return {
                                                        Customer: bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—',
                                                        'Meter Serial': bill.meter?.serial || '—',
                                                        Date: bill.created_at
                                                            ? new Date(bill.created_at).toLocaleDateString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '—',
                                                        Total: formatSSPCurrency(totalSum),
                                                        Paid: formatSSPCurrency(paid),
                                                        Balance: formatSSPCurrency(balance),
                                                        'Ref No': bill?.payment?.reference_number || '—',
                                                        Status: bill.status?.toUpperCase() || (bill.current_balance <= 0 ? 'PAID' : 'PENDING'),
                                                    };
                                                });

                                                // Calculate summary matching billing page format
                                                const totalAmount = filteredBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);
                                                const totalPaid = filteredBills.reduce(
                                                    (sum, bill) => sum + parseFloat(bill?.payment?.amount_paid || 0),
                                                    0,
                                                );
                                                const totalBalance = totalAmount - totalPaid;
                                                const paidCount = filteredBills.filter(
                                                    (bill) => bill.status === 'paid' || bill.current_balance <= 0,
                                                ).length;
                                                const unpaidCount = filteredBills.filter(
                                                    (bill) => bill.status !== 'paid' && bill.current_balance > 0,
                                                ).length;

                                                const summary = {
                                                    'Total Bills': filteredBills.length,
                                                    'Total Amount': formatSSPCurrency(totalAmount),
                                                    'Total Paid': formatSSPCurrency(totalPaid),
                                                    'Total Balance': formatSSPCurrency(totalBalance),
                                                    'Paid Bills': paidCount,
                                                    'Unpaid Bills': unpaidCount,
                                                };

                                                exportToExcel(billsData, 'unpaid-bills', summary);
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => printTable('Unpaid Bills')}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </Button>
                                        <Button asChild size="sm">
                                            <Link href="/billing">View All Bills</Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                                    <Input
                                        placeholder="Search bills by customer, bill number, amount..."
                                        value={searchBills}
                                        onChange={(e) => setSearchBills(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full" data-print="bills">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Bill #</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Period</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filterBills(allBills?.data || []).length > 0 ? (
                                                filterBills(allBills?.data || []).map((bill) => (
                                                    <tr
                                                        key={bill.id}
                                                        className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                    >
                                                        <td className="px-4 py-3 text-sm">
                                                            <Link href={`/billing/${bill.id}`} className="text-blue-600 hover:underline">
                                                                #{bill.id}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {bill.billing_period_start && bill.billing_period_end
                                                                ? `${new Date(bill.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(bill.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                                : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium">{formatSSPCurrency(bill.total_amount)}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                    bill.current_balance <= 0
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                }`}
                                                            >
                                                                {bill.current_balance <= 0 ? 'PAID' : 'PENDING'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {bill.current_balance > 0 && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                    onClick={() => handleBillPayment(bill)}
                                                                >
                                                                    <CreditCard className="h-3 w-3" />
                                                                    Pay
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                                                        No bills found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {allBills?.links && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-slate-500">
                                            Showing {allBills.from} to {allBills.to} of {allBills.total} results
                                        </div>
                                        <div className="flex space-x-2">
                                            {allBills.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-md px-3 py-2 text-sm ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                              : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="mt-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">All Invoices</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                const filteredInvoices = filterInvoices(allInvoices?.data || []);
                                                const invoicesData = filteredInvoices.map((invoice) => {
                                                    const invoiceAmount = parseFloat(invoice.amount_due) || 0;
                                                    const paymentDetails = getInvoicePaymentDetails(invoice.id, invoiceAmount);
                                                    return {
                                                        'Invoice #': invoice.invoice_number || invoice.id,
                                                        Customer: invoice.customer
                                                            ? `${invoice.customer.first_name} ${invoice.customer.last_name}`
                                                            : '—',
                                                        Reason: invoice.reason || '—',
                                                        'Issue Date': invoice.issue_date
                                                            ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '—',
                                                        'Due Date': invoice.due_date
                                                            ? new Date(invoice.due_date).toLocaleDateString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '—',
                                                        'Total Amount': formatSSPCurrency(invoice.amount_due),
                                                        'Amount Paid': formatSSPCurrency(paymentDetails.amountPaid),
                                                        Balance: formatSSPCurrency(paymentDetails.balance),
                                                        'Payment Date': paymentDetails.paymentDate,
                                                        Status: invoice.status?.toUpperCase() || 'UNKNOWN',
                                                    };
                                                });

                                                // Calculate summary
                                                const totalRevenue = filteredInvoices.reduce(
                                                    (sum, invoice) => sum + (parseFloat(invoice.amount_due) || 0),
                                                    0,
                                                );
                                                const totalPaid = filteredInvoices.reduce((sum, invoice) => {
                                                    const invoiceAmount = parseFloat(invoice.amount_due) || 0;
                                                    const paymentDetails = getInvoicePaymentDetails(invoice.id, invoiceAmount);
                                                    return sum + paymentDetails.amountPaid;
                                                }, 0);
                                                const totalBalance = totalRevenue - totalPaid;

                                                const summary = {
                                                    'Total Revenue': formatSSPCurrency(totalRevenue),
                                                    'Total Paid': formatSSPCurrency(totalPaid),
                                                    'Total Balance': formatSSPCurrency(totalBalance),
                                                    'Total Invoices': filteredInvoices.length,
                                                };

                                                exportToExcel(invoicesData, 'unpaid-invoices', summary);
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => printTable('Unpaid Invoices')}>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                                    <Input
                                        placeholder="Search invoices by customer, number, status..."
                                        value={searchInvoices}
                                        onChange={(e) => setSearchInvoices(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full" data-print="invoices">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Invoice #</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Issue Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filterInvoices(allInvoices?.data || []).length > 0 ? (
                                                filterInvoices(allInvoices?.data || []).map((invoice) => (
                                                    <tr
                                                        key={invoice.id}
                                                        className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                    >
                                                        <td className="px-4 py-3 text-sm">
                                                            <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                                                                #{invoice.invoice_number || invoice.id}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.issue_date
                                                                ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
                                                                      year: 'numeric',
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                  })
                                                                : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.due_date
                                                                ? new Date(invoice.due_date).toLocaleDateString('en-US', {
                                                                      year: 'numeric',
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                  })
                                                                : '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium">{formatSSPCurrency(invoice.amount_due)}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                    invoice.status === 'paid'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                        : invoice.status === 'pending'
                                                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                }`}
                                                            >
                                                                {invoice.status?.toUpperCase() || 'UNKNOWN'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {invoice.status !== 'paid' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                                    onClick={() => handleInvoicePayment(invoice)}
                                                                >
                                                                    <CreditCard className="h-3 w-3" />
                                                                    Pay
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                                                        No invoices found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {allInvoices?.links && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-slate-500">
                                            Showing {allInvoices.from} to {allInvoices.to} of {allInvoices.total} results
                                        </div>
                                        <div className="flex space-x-2">
                                            {allInvoices.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-md px-3 py-2 text-sm ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                                              : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Bill Payment Modal */}
            <PaymentFormModal
                open={billPaymentModalOpen}
                onOpenChange={setBillPaymentModalOpen}
                defaultValues={billPaymentDefaults}
                onSubmit={submitBillPayment}
                methods={[
                    { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
                    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
                ]}
            />

            {/* Invoice Payment Modal */}
            <InvoicePaymentFormModal
                open={invoicePaymentModalOpen}
                onOpenChange={setInvoicePaymentModalOpen}
                onSubmit={submitInvoicePayment}
                defaultValues={invoicePaymentDefaults}
                customer={selectedInvoiceForPayment?.customer}
                methods={[
                    { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
                    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
                ]}
            />
        </AppLayout>
    );
}
