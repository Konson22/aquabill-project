import InvoicePaymentFormModal from '@/components/payments/InvoicePaymentFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import InvoiceForm from '@/pages/forms/invoice-form';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CreditCard, DollarSign, Download, Edit, Eye, Filter, Plus, Receipt, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { formatSSPCurrency } from '../../../utils/formatSSPCurrency';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Invoices', href: '/invoices' },
];

export default function InvoiceIndex({ invoices, filters = {}, customers = [], meters = [] }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomerForInvoice, setSelectedCustomerForInvoice] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

    const handleSearch = () => {
        router.get(
            '/invoices',
            {
                search: searchTerm,
                status: statusFilter === 'all' ? '' : statusFilter,
                date: dateFilter === 'all' ? '' : dateFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        router.get(
            '/invoices',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
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

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Invoices</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage service invoices and billing</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-2">
                        <Link href="/finance">
                            <DollarSign className="h-4 w-4" /> Finance
                        </Link>
                    </Button>
                    <Button onClick={handleCreateInvoice} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> New Invoice
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search invoices, customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Date Range</label>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All dates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All dates</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This week</SelectItem>
                                    <SelectItem value="month">This month</SelectItem>
                                    <SelectItem value="quarter">This quarter</SelectItem>
                                    <SelectItem value="year">This year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleSearch} className="gap-2">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear
                            </Button>
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
                            <CardDescription>{invoices?.total ? `${invoices.total} invoices found` : 'No invoices found'}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
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
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Issue Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount Due</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">#Ref No</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices?.data?.length > 0 ? (
                                    invoices.data.map((invoice) => {
                                        const overdue = isOverdue(invoice.due_date, invoice.status);
                                        const displayStatus = overdue ? 'overdue' : invoice.status;

                                        return (
                                            <tr
                                                key={invoice.id}
                                                className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                            >
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
                                                <td className="px-4 py-3 text-sm">
                                                    <div className={`flex items-center gap-1 ${overdue ? 'font-medium text-red-600' : ''}`}>
                                                        <Calendar className="h-3 w-3" />
                                                        {invoice.due_date
                                                            ? new Date(invoice.due_date).toLocaleDateString('en-US', {
                                                                  year: 'numeric',
                                                                  month: 'short',
                                                                  day: 'numeric',
                                                              })
                                                            : '—'}
                                                    </div>
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
                                        <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
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
