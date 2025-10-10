import InvoicePaymentFormModal from '@/components/payments/InvoicePaymentFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomSearchBar from '@/components/ui/custom-search-bar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select } from '@/components/ui/input';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import InvoiceForm from '@/pages/forms/invoice-form';
import { Head, Link, router } from '@inertiajs/react';
import { Clock, CreditCard, DollarSign, Download, Edit, Eye, Filter, Plus, Printer, Receipt, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatSSPCurrency } from '../../../utils/formatSSPCurrency';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Invoices', href: '/invoices' },
];

export default function InvoiceIndex({ invoices, filters = {}, customers = [], meters = [] }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [yearFilter, setYearFilter] = useState(filters.year || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomerForInvoice, setSelectedCustomerForInvoice] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const invoiceItems = useMemo(() => {
        if (!invoices || !invoices.data) return [];
        return invoices.data;
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        let list = invoiceItems;
        if (searchQuery.trim() !== '') {
            const s = searchQuery.toLowerCase();
            list = list.filter((invoice) => {
                const customerName = invoice.customer ? `${invoice.customer.first_name || ''} ${invoice.customer.last_name || ''}`.toLowerCase() : '';
                const reason = (invoice.reason || '').toLowerCase();
                const refNo = (invoice.reference_number || '').toString().toLowerCase();
                return customerName.includes(s) || reason.includes(s) || refNo.includes(s);
            });
        }
        if (statusFilter) {
            list = list.filter((invoice) => invoice.status === statusFilter);
        }
        if (yearFilter) {
            list = list.filter((invoice) => {
                const invoiceDate = new Date(invoice.issue_date);
                return invoiceDate.getFullYear().toString() === yearFilter;
            });
        }
        if (monthFilter) {
            list = list.filter((invoice) => {
                const invoiceDate = new Date(invoice.issue_date);
                return (invoiceDate.getMonth() + 1).toString() === monthFilter;
            });
        }
        return list;
    }, [invoiceItems, searchQuery, statusFilter, yearFilter, monthFilter]);

    // Sync filters to server (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                year: yearFilter || undefined,
                month: monthFilter || undefined,
            };
            router.get('/invoices', params, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(handle);
    }, [searchQuery, statusFilter, yearFilter, monthFilter]);

    const handleExport = () => {
        const headers = ['Invoice ID', 'Customer Name', 'Issue Date', 'Amount Due', 'Status', 'Reference Number', 'Reason', 'Due Date'];

        const rows = filteredInvoices.map((invoice) => [
            invoice.id,
            invoice.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : '',
            invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-US') : '',
            invoice.amount_due || '',
            invoice.status || '',
            invoice.reference_number || '',
            invoice.reason || '',
            invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US') : '',
        ]);

        // Calculate summary totals
        const summary = {
            totalInvoices: filteredInvoices.length,
            totalAmount: filteredInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount_due || 0), 0),
            paidInvoices: filteredInvoices.filter((invoice) => invoice.status === 'paid').length,
            pendingInvoices: filteredInvoices.filter((invoice) => invoice.status === 'pending').length,
            overdueInvoices: filteredInvoices.filter((invoice) => {
                if (invoice.status === 'paid' || invoice.status === 'cancelled') return false;
                return new Date(invoice.due_date) < new Date();
            }).length,
        };

        const summaryRows = [
            [''],
            ['SUMMARY'],
            ['Total Invoices', summary.totalInvoices],
            ['Total Amount (SSP)', summary.totalAmount],
            ['Paid Invoices', summary.paidInvoices],
            ['Pending Invoices', summary.pendingInvoices],
            ['Overdue Invoices', summary.overdueInvoices],
            ['Collection Rate (%)', summary.totalAmount > 0 ? ((summary.paidInvoices / summary.totalInvoices) * 100).toFixed(2) : '0.00'],
        ];

        const csv = [headers, ...rows, ...summaryRows]
            .map((row) =>
                row
                    .map((cell) => {
                        const value = cell === null || cell === undefined ? '' : String(cell);
                        const escaped = value.replace(/"/g, '""');
                        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
                    })
                    .join(','),
            )
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ts = new Date().toISOString().split('T')[0];
        link.download = `invoices_export_${ts}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Selection helpers
    const isSelected = (id) => selectedIds.includes(id);
    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };
    const allSelected = filteredInvoices.length > 0 && filteredInvoices.every((invoice) => selectedIds.includes(invoice.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !filteredInvoices.some((invoice) => invoice.id === id)));
        } else {
            const ids = filteredInvoices.map((invoice) => invoice.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
    };
    const handlePrintSelected = () => {
        if (selectedIds.length === 0) return;
        const url = `/invoices/print-multiple?ids=${selectedIds.join(',')}`;
        window.open(url, '_blank');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
            pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
            cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
            overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return <Badge className={config.className}>{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'paid' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    const handleCreateInvoice = () => {
        setSelectedCustomerForInvoice(null);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setSelectedCustomerForInvoice(null);
    };

    const handleInvoiceSuccess = () => {
        setIsCreateModalOpen(false);
        setSelectedCustomerForInvoice(null);
        // Refresh the page to show the new invoice
        router.reload();
    };

    const handleRecordPayment = (invoice) => {
        setSelectedInvoiceForPayment(invoice);
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedInvoiceForPayment(null);
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setSelectedInvoiceForPayment(null);
        // Refresh the page to show updated invoice status
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="mb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Invoice Management</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive invoice system with advanced analytics</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Invoices</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{filteredInvoices.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {formatSSPCurrency(filteredInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount_due || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Invoices</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {filteredInvoices.filter((invoice) => invoice.status === 'pending').length}
                                </p>
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
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                            <Select
                                placeholder="All statuses"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={[
                                    { id: 'pending', name: 'Pending' },
                                    { id: 'paid', name: 'Paid' },
                                    { id: 'cancelled', name: 'Cancelled' },
                                    { id: 'overdue', name: 'Overdue' },
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

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Invoices</CardTitle>
                            <CardDescription>{filteredInvoices.length} invoices found</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <CustomSearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search invoices by customer name, reason, or reference number..."
                                className="w-80"
                                onClear={() => setSearchQuery('')}
                            />
                            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrintSelected} disabled={selectedIds.length === 0}>
                                <Printer className="h-4 w-4" />
                                Print Selected
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Select all</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrintSelected} disabled={selectedIds.length === 0}>
                                <Printer className="h-4 w-4" />
                                Print Selected
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Issue Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount Due</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">#Ref No</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => {
                                        const overdue = isOverdue(invoice.due_date, invoice.status);
                                        const displayStatus = overdue ? 'overdue' : invoice.status;

                                        return (
                                            <tr
                                                key={invoice.id}
                                                className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(invoice.id)}
                                                        onChange={() => toggleSelect(invoice.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {invoice.customer ? (
                                                        <div>
                                                            <div className="font-medium">
                                                                {invoice.customer.first_name} {invoice.customer.last_name}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{invoice.customer.phone}</div>
                                                        </div>
                                                    ) : (
                                                        '—'
                                                    )}
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

                                                <td className="px-4 py-3 text-sm font-medium">{formatSSPCurrency(invoice.amount_due)}</td>
                                                <td className="px-4 py-3 text-sm">{getStatusBadge(displayStatus)}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {invoice.payments && invoice.payments.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {invoice.payments.map((payment, index) => (
                                                                <div key={payment.id}>
                                                                    <Link
                                                                        href={`/payments/${payment.id}`}
                                                                        className="text-xs text-red-600 hover:underline"
                                                                    >
                                                                        {`REF-${payment.reference_number}` || '-'}
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">No payments</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="max-w-xs truncate" title={invoice.reason}>
                                                        {invoice.reason || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Link href={`/invoices/${invoice.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Link href={`/invoices/${invoice.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {invoice.status !== 'paid' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                                                onClick={() => handleRecordPayment(invoice)}
                                                                title="Record Payment"
                                                            >
                                                                <CreditCard className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this invoice?')) {
                                                                    router.delete(`/invoices/${invoice.id}`);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                                            <div className="flex flex-col items-center gap-2">
                                                <Receipt className="h-12 w-12 text-slate-400" />
                                                <div>No invoices found</div>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href="/invoices/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create First Invoice
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {invoices?.links && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Showing {invoices.from} to {invoices.to} of {invoices.total} results
                            </div>
                            <div className="flex space-x-2">
                                {invoices.links.map((link, index) => (
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
                </CardContent>
            </Card>

            {/* Create Invoice Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Create New Invoice</span>
                            <button
                                onClick={handleCloseModal}
                                className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </DialogTitle>
                        <DialogDescription>Select a customer and create their invoice</DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Customer *</label>
                            <Select
                                value={selectedCustomerForInvoice?.id?.toString() || ''}
                                onValueChange={(value) => {
                                    const customer = customers.find((c) => c.id.toString() === value);
                                    setSelectedCustomerForInvoice(customer);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a customer for this invoice" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                            {customer.first_name} {customer.last_name} - {customer.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedCustomerForInvoice && (
                            <InvoiceForm
                                customers={customers}
                                meters={meters}
                                isEditing={false}
                                onSuccess={handleInvoiceSuccess}
                                selectedCustomer={selectedCustomerForInvoice}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <InvoicePaymentFormModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                onSubmit={async (paymentData) => {
                    try {
                        // Submit payment data to backend using invoice payment endpoint
                        await router.post('/payments/invoice', {
                            invoice_id: selectedInvoiceForPayment?.id,
                            customer_id: selectedInvoiceForPayment?.customer_id,
                            amount_paid: paymentData.amount,
                            payment_method: paymentData.method,
                            payment_date: paymentData.date,
                            reference_number: paymentData.reference_number,
                        });
                        handlePaymentSuccess();
                    } catch (error) {
                        console.error('Payment submission error:', error);
                    }
                }}
                defaultValues={{
                    invoice_id: selectedInvoiceForPayment?.id,
                    customer_id: selectedInvoiceForPayment?.customer_id,
                    customer_name: selectedInvoiceForPayment?.customer
                        ? `${selectedInvoiceForPayment.customer.first_name} ${selectedInvoiceForPayment.customer.last_name}`
                        : 'N/A',
                    amount: selectedInvoiceForPayment?.amount_due,
                    due_date: selectedInvoiceForPayment?.due_date,
                    date: new Date().toISOString().split('T')[0],
                }}
                customer={selectedInvoiceForPayment?.customer}
            />
        </AppLayout>
    );
}
