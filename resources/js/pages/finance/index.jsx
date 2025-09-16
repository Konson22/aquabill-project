import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CreditCard, Download, FileText, Printer, Receipt, Search, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [{ title: 'Finance', href: '/finance' }];

export default function FinanceIndex({ stats, allPayments, allInvoices, allBills = [] }) {
    const [activeTab, setActiveTab] = useState('invoices');
    const [searchPayments, setSearchPayments] = useState('');
    const [searchInvoices, setSearchInvoices] = useState('');
    const [searchBills, setSearchBills] = useState('');

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance" />

            {/* Header Section */}
            <div className="mb-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Finance Dashboard</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Comprehensive overview of billing, invoicing, and payment management</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {/* Bills Card */}
                    <Link href="/billing" className="block">
                        <Card className="group cursor-pointer border-l-4 border-l-blue-500 transition-all duration-200 hover:shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="rounded-lg bg-blue-100 p-2 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/20 dark:group-hover:bg-blue-900/30">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Bills Management</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Manage customer bills and billing cycles</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Invoices Card */}
                    <Link href="/invoices" className="block">
                        <Card className="group cursor-pointer border-l-4 border-l-green-500 transition-all duration-200 hover:shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="rounded-lg bg-green-100 p-2 transition-colors group-hover:bg-green-200 dark:bg-green-900/20 dark:group-hover:bg-green-900/30">
                                            <Receipt className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Invoice System</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Create and track service invoices</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Payments Card */}
                    <Link href="/payments" className="block">
                        <Card className="group cursor-pointer border-l-4 border-l-purple-500 transition-all duration-200 hover:shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="rounded-lg bg-purple-100 p-2 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/20 dark:group-hover:bg-purple-900/30">
                                            <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Payment Processing</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Record and track payments</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Finance Overview - Essential Counts Only */}
            <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Finance Overview</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Bills</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{allBills?.total || 0}</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">All generated bills</p>
                                </div>
                                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:border-green-800 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Invoices</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{allInvoices?.total || 0}</p>
                                    <p className="text-xs text-green-700 dark:text-green-300">All created invoices</p>
                                </div>
                                <Receipt className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Unpaid Invoices</p>
                                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats?.unpaid_invoices || 0}</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">Awaiting payment</p>
                                </div>
                                <TrendingDown className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabbed Interface */}
            <Card>
                <CardHeader>
                    <CardTitle>Financial Records</CardTitle>
                    <CardDescription>View and manage payments, invoices, and bills</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="invoices" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                Invoices
                            </TabsTrigger>
                            <TabsTrigger value="bills" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Bills
                            </TabsTrigger>
                        </TabsList>

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
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={5}>
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
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
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
        </AppLayout>
    );
}
