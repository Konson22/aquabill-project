import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, MapPin, Phone, Printer, User, XCircle } from 'lucide-react';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Details', href: '#' },
];

export default function InvoiceShow({ invoice }) {
    const formatCurrency = (n) => `SSP ${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: {
                icon: CheckCircle,
                className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                label: 'PAID',
            },
            pending: {
                icon: Clock,
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                label: 'PENDING',
            },
            cancelled: {
                icon: XCircle,
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                label: 'CANCELLED',
            },
            overdue: {
                icon: AlertCircle,
                className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                label: 'OVERDUE',
            },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`${config.className} gap-1`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const isOverdue = (dueDate, status) => {
        if (status === 'paid' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    const displayStatus = isOverdue(invoice.due_date, invoice.status) ? 'overdue' : invoice.status;

    const handlePrint = () => {
        window.open(`/invoices/${invoice.id}/print`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice #${invoice.invoice_number || invoice.id}`}>
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-break { page-break-before: always; }
                        body { font-size: 12px; }
                        .print-header { 
                            border-bottom: 2px solid #000; 
                            margin-bottom: 20px; 
                            padding-bottom: 10px;
                        }
                        .print-section { 
                            margin-bottom: 15px; 
                            page-break-inside: avoid;
                        }
                    }
                `}</style>
            </Head>

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm" className="no-print">
                        <Link href="/invoices">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoices
                        </Link>
                    </Button>
                    <div className="print-header">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Invoice #{invoice.invoice_number || invoice.id}</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Created on{' '}
                            {new Date(invoice.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <div className="no-print flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Invoice Details */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Invoice Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Invoice Number</label>
                                    <p className="mt-1 text-lg font-semibold">#{invoice.invoice_number || invoice.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                    <div className="mt-1">{getStatusBadge(displayStatus)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Date</label>
                                    <p className="mt-1 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {invoice.issue_date
                                            ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Date</label>
                                    <p
                                        className={`mt-1 flex items-center gap-2 ${isOverdue(invoice.due_date, invoice.status) ? 'font-medium text-red-600' : ''}`}
                                    >
                                        <Calendar className="h-4 w-4" />
                                        {invoice.due_date
                                            ? new Date(invoice.due_date).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reason</label>
                                    <p className="mt-1">{invoice.reason || 'No reason provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    {invoice.customer && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/customers/${invoice.customer.id}`}>View Profile</Link>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                                        <p className="mt-1 text-lg font-semibold">
                                            {invoice.customer.first_name} {invoice.customer.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                        <p className="mt-1 flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {invoice.customer.phone || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                                        <p className="mt-1 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {invoice.customer.address || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meter Information */}
                    {invoice.meter && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Meter Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Meter Number</label>
                                        <p className="mt-1 font-medium">{invoice.meter.meter_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</label>
                                        <p className="mt-1">{invoice.meter.location || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>Payments received for this invoice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                                            <div>
                                                <div className="font-medium">{formatCurrency(payment.amount_paid)}</div>
                                                <div className="text-sm text-slate-500">
                                                    {payment.payment_date
                                                        ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                                                              year: 'numeric',
                                                              month: 'short',
                                                              day: 'numeric',
                                                          })
                                                        : '—'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium capitalize">
                                                    {String(payment.payment_method || '').replace('_', ' ')}
                                                </div>
                                                <div className="text-sm text-slate-500">{payment.reference_number || '—'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="no-print space-y-6">
                    {/* Amount Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Amount Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Amount Due</span>
                                    <span className="font-medium">{formatCurrency(invoice.amount_due)}</span>
                                </div>
                                {invoice.payments && invoice.payments.length > 0 && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(
                                                    invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0),
                                                )}
                                            </span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Balance</span>
                                                <span
                                                    className={`font-bold ${
                                                        invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0) >=
                                                        parseFloat(invoice.amount_due || 0)
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        parseFloat(invoice.amount_due || 0) -
                                                            invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
