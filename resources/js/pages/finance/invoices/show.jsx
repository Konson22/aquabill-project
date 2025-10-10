import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    FileText,
    MapPin,
    Phone,
    Printer,
    TrendingUp,
    User,
    XCircle,
    Zap,
} from 'lucide-react';

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
            <Badge className={`${config.className} gap-1 px-3 py-1`}>
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

    // Calculate payment progress
    const totalPaid = invoice.payments ? invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0) : 0;
    const amountDue = parseFloat(invoice.amount_due || 0);
    const paymentProgress = amountDue > 0 ? (totalPaid / amountDue) * 100 : 0;
    const isFullyPaid = paymentProgress >= 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice #${invoice.invoice_number || invoice.id}`}>
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-break { page-break-before: always; }
                        body { 
                            font-size: 14px; 
                            line-height: 1.4;
                        }
                        .print-header { 
                            border-bottom: 2px solid #000; 
                            margin-bottom: 20px; 
                            padding-bottom: 10px;
                        }
                        .print-section { 
                            margin-bottom: 15px; 
                            page-break-inside: avoid;
                        }
                        /* Add borders around all cards in print */
                        .print-card {
                            border: 1px solid #000 !important;
                            border-radius: 8px !important;
                            margin-bottom: 20px !important;
                            padding: 16px !important;
                            box-shadow: none !important;
                        }
                        /* Ensure proper spacing for print */
                        .print-card h3, .print-card h4, .print-card h5 {
                            margin-top: 0 !important;
                            margin-bottom: 12px !important;
                            font-weight: bold !important;
                        }
                        .print-card p, .print-card div {
                            margin-bottom: 8px !important;
                        }
                        /* Make text more readable in print */
                        .text-slate-900, .text-slate-100 {
                            color: #000 !important;
                        }
                        .text-slate-600, .text-slate-400 {
                            color: #333 !important;
                        }
                    }
                `}</style>
            </Head>

            {/* Enhanced Header Section */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="print-header">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        Invoice #{invoice.invoice_number || invoice.id}
                                    </h1>
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
                        </div>
                    </div>
                    <div className="no-print flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* Status and Progress Section */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        {getStatusBadge(displayStatus)}
                        {isFullyPaid && (
                            <Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                <CheckCircle className="h-3 w-3" />
                                FULLY PAID
                            </Badge>
                        )}
                    </div>
                    {amountDue > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Progress</span>
                            <div className="flex items-center gap-2">
                                <Progress value={paymentProgress} className="w-32" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{Math.round(paymentProgress)}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-8 lg:col-span-2">
                    {/* Invoice Information Card */}
                    <Card className="print-card border-l-4 border-l-blue-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Invoice Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Invoice Number</label>
                                        <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                            #{invoice.invoice_number || invoice.id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Date</label>
                                        <p className="mt-1 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            {invoice.issue_date
                                                ? new Date(invoice.issue_date).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric',
                                                  })
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Date</label>
                                        <p
                                            className={`mt-1 flex items-center gap-2 ${
                                                isOverdue(invoice.due_date, invoice.status)
                                                    ? 'font-bold text-red-600 dark:text-red-400'
                                                    : 'text-slate-900 dark:text-slate-100'
                                            }`}
                                        >
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            {invoice.due_date
                                                ? new Date(invoice.due_date).toLocaleDateString('en-US', {
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric',
                                                  })
                                                : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                        <div className="mt-1">{getStatusBadge(displayStatus)}</div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reason</label>
                                    <p className="mt-1 text-slate-900 dark:text-slate-100">{invoice.reason || 'No reason provided'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information Card */}
                    {invoice.customer && (
                        <Card className="print-card border-l-4 border-l-green-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-green-600" />
                                        Customer Information
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/customers/${invoice.customer.id}`}>View Profile</Link>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</label>
                                            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                {invoice.customer.first_name} {invoice.customer.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                            <p className="mt-1 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                <Phone className="h-4 w-4 text-slate-500" />
                                                {invoice.customer.phone || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                                            <p className="mt-1 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                {invoice.customer.address || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meter Information Card */}
                    {invoice.meter && (
                        <Card className="print-card border-l-4 border-l-purple-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                    Meter Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Meter Number</label>
                                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{invoice.meter.meter_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</label>
                                        <p className="mt-1 text-slate-900 dark:text-slate-100">{invoice.meter.location || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment History Card */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <Card className="print-card border-l-4 border-l-orange-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-orange-600" />
                                    Payment History
                                </CardTitle>
                                <CardDescription>Payments received for this invoice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {invoice.payments.map((payment, index) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {formatCurrency(payment.amount_paid)}
                                                    </div>
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
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-slate-900 capitalize dark:text-slate-100">
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

                {/* Enhanced Summary Sidebar */}
                <div className="no-print space-y-6">
                    {/* Amount Summary Card */}
                    <Card className="print-card border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                Amount Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">Amount Due</span>
                                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(invoice.amount_due)}</span>
                                </div>

                                {invoice.payments && invoice.payments.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(totalPaid)}
                                            </span>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">Balance</span>
                                                <span
                                                    className={`text-lg font-bold ${
                                                        totalPaid >= amountDue
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}
                                                >
                                                    {formatCurrency(amountDue - totalPaid)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card className="print-card">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Payment Progress</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{Math.round(paymentProgress)}%</span>
                                </div>
                                <Progress value={paymentProgress} className="w-full" />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Payments</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{invoice.payments?.length || 0}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Days Overdue</span>
                                    <span
                                        className={`text-sm font-semibold ${
                                            isOverdue(invoice.due_date, invoice.status)
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}
                                    >
                                        {isOverdue(invoice.due_date, invoice.status)
                                            ? Math.ceil((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24))
                                            : '0'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
