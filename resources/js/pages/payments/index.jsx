import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Clock, CreditCard, DollarSign, Download, Filter, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Payments', href: '/payments' },
];

export default function PaymentsIndex({ payments }) {
    const items = payments?.data || [];

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPayments, setFilteredPayments] = useState(items);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        customer: '',
    });

    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

    // Get unique customers for filter
    const customers = [...new Set(items.map((p) => p.customer).filter(Boolean))];

    // Filter payments based on search query and filters
    useEffect(() => {
        let filtered = items;

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter((payment) => {
                // Search in customer name
                const customerName = payment.customer ? `${payment.customer.first_name || ''} ${payment.customer.last_name || ''}`.toLowerCase() : '';
                if (customerName.includes(searchLower)) return true;

                // Search in reference number
                const refNumber = payment.reference_number?.toLowerCase() || '';
                if (refNumber.includes(searchLower)) return true;

                // Search in amount paid
                const amount = payment.amount_paid?.toString() || '';
                if (amount.includes(searchLower)) return true;

                // Search in total bill amount
                const totalBill = payment.bill?.total_amount?.toString() || '';
                if (totalBill.includes(searchLower)) return true;

                return false;
            });
        }

        // Apply customer filter
        if (filters.customer) {
            filtered = filtered.filter((p) => p.customer?.id === parseInt(filters.customer));
        }

        // Apply date range filter
        if (filters.dateFrom) {
            filtered = filtered.filter((p) => new Date(p.payment_date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            filtered = filtered.filter((p) => new Date(p.payment_date) <= new Date(filters.dateTo));
        }

        setFilteredPayments(filtered);
    }, [searchQuery, filters, items]);

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setFilters({
            dateFrom: '',
            dateTo: '',
            customer: '',
        });
    };

    // Check if any filters are active
    const hasActiveFilters = searchQuery.trim() !== '' || Object.values(filters).some((value) => value !== '');

    // Calculate KPI metrics
    const calculateKPIs = () => {
        const data = hasActiveFilters ? filteredPayments : items;

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
        const data = hasActiveFilters ? filteredPayments : items;

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

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Payments</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {hasActiveFilters
                                ? `Showing ${filteredPayments.length} of ${items.length} payments`
                                : `Manage and track all payment transactions`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Reports
                        </Button>
                        <Button onClick={exportToExcel}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Excel
                        </Button>
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
                                <p className="text-xs text-slate-500 dark:text-slate-500">{hasActiveFilters ? 'filtered results' : 'all time'}</p>
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
                                <p className="text-xs text-slate-500 dark:text-slate-500">{hasActiveFilters ? 'filtered amount' : 'all time'}</p>
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

            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Filter Toggle and Controls */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                                {Object.values(filters).filter((v) => v !== '').length + (searchQuery ? 1 : 0)}
                            </span>
                        )}
                    </Button>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Filter Payments</CardTitle>
                            <CardDescription>Use the filters below to narrow down your search results</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Customer Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer</label>
                                    <Select
                                        value={filters.customer || 'all'}
                                        onValueChange={(value) => setFilters((prev) => ({ ...prev, customer: value === 'all' ? '' : value }))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="All Customers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Customers</SelectItem>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    {customer.first_name} {customer.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date From */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date From</label>
                                    <Input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                                        className="w-full"
                                    />
                                </div>

                                {/* Date To */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date To</label>
                                    <Input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {hasActiveFilters
                                        ? `${Object.values(filters).filter((v) => v !== '').length + (searchQuery ? 1 : 0)} filter(s) active`
                                        : 'No filters applied'}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                    <Button size="sm" onClick={() => setShowFilters(false)}>
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payments</CardTitle>
                            <CardDescription>List of recorded payments</CardDescription>
                        </div>
                        <div className="flex-1 pl-16">
                            <Input
                                type="text"
                                placeholder="Search payments by customer, reference number, or amount..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
                                            {hasActiveFilters ? 'No payments match your filters.' : 'No payments found.'}
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
