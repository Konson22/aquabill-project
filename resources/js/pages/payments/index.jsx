import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomSearchBar from '@/components/ui/custom-search-bar';
import { Select } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, CreditCard, DollarSign, Download, Filter, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Payments', href: '/payments' },
];

export default function PaymentsIndex({ payments, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [yearFilter, setYearFilter] = useState(filters.year || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');

    const paymentItems = useMemo(() => {
        if (!payments || !payments.data) return [];
        return payments.data;
    }, [payments]);

    const filteredPayments = useMemo(() => {
        let list = paymentItems;
        if (searchQuery.trim() !== '') {
            const s = searchQuery.toLowerCase();
            list = list.filter((payment) => {
                const customerName = payment.customer ? `${payment.customer.first_name || ''} ${payment.customer.last_name || ''}`.toLowerCase() : '';
                const refNumber = (payment.reference_number || '').toString().toLowerCase();
                const amount = (payment.amount_paid || '').toString().toLowerCase();
                return customerName.includes(s) || refNumber.includes(s) || amount.includes(s);
            });
        }
        if (statusFilter) {
            // For payments, we can filter by payment method or status
            list = list.filter((payment) => payment.payment_method === statusFilter);
        }
        if (yearFilter) {
            list = list.filter((payment) => {
                const paymentDate = new Date(payment.payment_date);
                return paymentDate.getFullYear().toString() === yearFilter;
            });
        }
        if (monthFilter) {
            list = list.filter((payment) => {
                const paymentDate = new Date(payment.payment_date);
                return (paymentDate.getMonth() + 1).toString() === monthFilter;
            });
        }
        return list;
    }, [paymentItems, searchQuery, statusFilter, yearFilter, monthFilter]);

    // Sync filters to server (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                year: yearFilter || undefined,
                month: monthFilter || undefined,
            };
            router.get('/payments', params, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(handle);
    }, [searchQuery, statusFilter, yearFilter, monthFilter]);

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

    // Calculate KPI metrics
    const calculateKPIs = () => {
        const data = filteredPayments;

        // Total payments
        const totalPayments = data.length;

        // Total amount collected
        const totalAmount = data.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

        // Average payment amount
        const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

        // Unique customers who made payments
        const uniqueCustomers = new Set(data.map((p) => p.customer?.id).filter(Boolean)).size;

        // Payment methods distribution
        const paymentMethodsCount = data.reduce((acc, p) => {
            const method = p.payment_method || 'unknown';
            acc[method] = (acc[method] || 0) + 1;
            return acc;
        }, {});

        // Recent payments (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentPayments = data.filter((p) => new Date(p.payment_date) >= sevenDaysAgo).length;

        // This month's payments
        const thisMonth = new Date();
        const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
        const thisMonthPayments = data.filter((p) => new Date(p.payment_date) >= thisMonthStart).length;

        // Outstanding balance (total bill amount - total paid)
        const totalBillAmount = data.reduce((sum, p) => sum + parseFloat(p.bill?.total_amount || 0), 0);
        const outstandingBalance = totalBillAmount - totalAmount;

        return {
            totalPayments,
            totalAmount,
            averagePayment,
            uniqueCustomers,
            paymentMethodsCount,
            recentPayments,
            thisMonthPayments,
            outstandingBalance,
            totalBillAmount,
        };
    };

    const kpis = calculateKPIs();

    // Export to Excel functionality
    const exportToExcel = () => {
        const data = filteredPayments;

        // Calculate summary statistics
        const totalPayments = data.length;
        const totalAmount = data.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
        const billCount = data.filter((p) => p.bill_id).length;
        const invoiceCount = data.filter((p) => p.invoice_id).length;
        const uniqueCustomers = new Set(data.map((p) => p.customer?.id).filter(Boolean)).size;

        // Prepare summary data
        const summaryData = [
            ['PAYMENTS SUMMARY REPORT'],
            [
                'Generated on:',
                new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            ],
            [''],
            ['SUMMARY STATISTICS'],
            ['Total Payments:', totalPayments],
            ['Total Amount Collected:', formatSSPCurrency(totalAmount)],
            ['Unique Customers:', uniqueCustomers],
            [''],
            ['PAYMENT BREAKDOWN'],
            ['Bills:', billCount],
            ['Invoices:', invoiceCount],
            [''],
            ['DETAILED PAYMENTS DATA'],
            [''],
        ];

        // Prepare detailed data for export
        const exportData = data.map((payment, index) => ({
            'S/N': index + 1,
            'Customer Name': payment.customer ? `${payment.customer.first_name} ${payment.customer.last_name}` : 'N/A',
            'Payment Type': payment.bill_id ? 'Billing' : 'Invoice',
            'Reference Number': payment.reference_number || 'N/A',
            'Payment Date': formatDate(payment.payment_date),
            'Total Bill Amount': payment.bill?.total_amount || 0,
            'Amount Paid': payment.amount_paid || 0,
            Balance: (payment.bill?.total_amount || 0) - (payment.amount_paid || 0),
        }));

        // Convert to CSV format with summary
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
            // Summary section
            ...summaryData.map((row) => row.join(',')),
            // Headers
            headers.join(','),
            // Data rows
            ...exportData.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header];
                        // Escape commas and quotes in CSV
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value;
                    })
                    .join(','),
            ),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Generate filename with current date
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const filename = `payments-report-${dateStr}.csv`;

        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />

            {/* Modern Header Section */}
            <div className="mb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Payment Management</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive payment tracking system with advanced analytics</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Total Payments */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Payments</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpis.totalPayments.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    {searchQuery || statusFilter || yearFilter || monthFilter ? 'filtered results' : 'all time'}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Amount Collected */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Collected</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatSSPCurrency(kpis.totalAmount)}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    {searchQuery || statusFilter || yearFilter || monthFilter ? 'filtered amount' : 'all time'}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary KPI Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent Activity</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{kpis.recentPayments}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">payments in last 7 days</p>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/20">
                                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Outstanding Balance */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding</p>
                                <p
                                    className={`text-xl font-bold ${kpis.outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}
                                >
                                    {formatSSPCurrency(Math.abs(kpis.outstandingBalance))}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    {kpis.outstandingBalance > 0 ? 'balance due' : 'fully paid'}
                                </p>
                            </div>
                            <div
                                className={`rounded-full p-3 ${kpis.outstandingBalance > 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}
                            >
                                <DollarSign
                                    className={`h-5 w-5 ${kpis.outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Advanced Filters
                            </CardTitle>
                            <CardDescription>Refine your search with powerful filtering options</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('');
                                setYearFilter('');
                                setMonthFilter('');
                            }}
                        >
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                            <Select
                                placeholder="All methods"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { id: 'cash', name: 'Cash' },
                                    { id: 'mobile_money', name: 'Mobile Money' },
                                    { id: 'bank_transfer', name: 'Bank Transfer' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                            <Select
                                placeholder="All years"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                options={[
                                    { id: '2025', name: '2025' },
                                    { id: '2026', name: '2026' },
                                    { id: '2027', name: '2027' },
                                    { id: '2028', name: '2028' },
                                    { id: '2029', name: '2029' },
                                    { id: '2030', name: '2030' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
                            <Select
                                placeholder="All months"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                options={[
                                    { id: '1', name: 'January' },
                                    { id: '2', name: 'February' },
                                    { id: '3', name: 'March' },
                                    { id: '4', name: 'April' },
                                    { id: '5', name: 'May' },
                                    { id: '6', name: 'June' },
                                    { id: '7', name: 'July' },
                                    { id: '8', name: 'August' },
                                    { id: '9', name: 'September' },
                                    { id: '10', name: 'October' },
                                    { id: '11', name: 'November' },
                                    { id: '12', name: 'December' },
                                ]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payments Overview</CardTitle>
                            <CardDescription>Comprehensive payment tracking and management</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="max-w-md flex-1">
                                <CustomSearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search payments by customer, reference, or amount..."
                                />
                            </div>
                            <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Pay/Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Ref No</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Total Bill</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount Paid</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-3 text-sm">
                                                {p.customer ? (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                        <span>
                                                            {p.customer.first_name} {p.customer.last_name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {p.bill_id ? (
                                                    <Link href={route('billing.show', p.bill_id)} className="text-blue-600 hover:underline">
                                                        Billing
                                                    </Link>
                                                ) : (
                                                    <Link href={`finance/invoice/${p.invoice_id}`} className="text-blue-600 hover:underline">
                                                        Invoice
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-rose-500">#{p.reference_number || '—'}</td>
                                            <td className="px-4 py-3 text-sm">{formatDate(p.payment_date)}</td>
                                            <td className="px-4 py-3 text-left text-sm font-medium">
                                                {formatSSPCurrency(p?.bill?.total_amount || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-left text-sm font-medium">{formatSSPCurrency(p.amount_paid)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                {formatSSPCurrency((p?.bill?.total_amount || 0) - p.amount_paid)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                                            {searchQuery || statusFilter || yearFilter || monthFilter
                                                ? 'No payments match your filters.'
                                                : 'No payments found.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
