import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    Printer,
} from 'lucide-react';

export default function InvoiceShow({ invoice }) {
    const totalPaid =
        invoice.payments?.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0,
        ) || 0;
    const balance = Number(invoice.amount) - totalPaid;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'fully paid':
                return 'bg-emerald-600 hover:bg-emerald-700 border-transparent text-white';
            case 'partial':
            case 'partial paid':
                return 'bg-amber-500 hover:bg-amber-600 border-transparent text-white';
            case 'overdue':
                return 'bg-red-600 hover:bg-red-700 border-transparent text-white';
            case 'pending':
            case 'unpaid':
            default:
                return 'text-slate-600 border-slate-300';
        }
    };

    const InvoiceCard = ({ className = '' }) => (
        <Card
            className={`border-slate-200 shadow-sm ${className}`.trim()}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-slate-100 pb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl font-bold">
                            INVOICE
                        </CardTitle>
                    </div>
                    <span className="mt-1 font-mono text-sm text-muted-foreground">
                        #{invoice.invoice_number}
                    </span>
                </div>
                <div className="text-right">
                    <Badge
                        variant="outline"
                        className={`px-3 py-1 text-sm capitalize ${getStatusColor(invoice.status)}`}
                    >
                        {invoice.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-8 p-6 md:p-8">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">
                            Issue Date
                        </span>
                        <div className="mt-1 flex items-center gap-2 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(invoice.created_at)}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-muted-foreground">
                            Due Date
                        </span>
                        <div className="mt-1 flex items-center justify-end gap-2 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(invoice.due_date)}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Addresses */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            From
                        </h3>
                        <div className="text-lg font-medium">SSUWC</div>
                        <div className="text-sm leading-relaxed text-muted-foreground">
                            Juba
                            <br />
                            Behind Directorate of Passports, Immigration and
                            Passports
                            <br />
                            +211 912 345 678
                        </div>
                    </div>
                    <div className="space-y-3 md:text-right">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Bill To
                        </h3>
                        <div className="text-lg font-medium">
                            {invoice.customer?.name}
                        </div>
                        <div className="text-sm leading-relaxed text-muted-foreground">
                            {invoice.home?.address}
                            <br />
                            {invoice.customer?.phone_number}
                            <br />
                            {invoice.customer?.email}
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="overflow-hidden rounded-lg border border-slate-100">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[60%]">
                                    Description
                                </TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">
                                    {invoice.description ||
                                        'General Invoice Service'}
                                </TableCell>
                                <TableCell className="text-muted-foreground capitalize">
                                    {invoice.type || 'Service'}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(invoice.amount)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end gap-3 pt-4">
                    <div className="flex w-full justify-between text-lg font-bold md:w-1/2">
                        <span>Total</span>
                        <span>{formatCurrency(invoice.amount)}</span>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-12 pt-6">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Issued By
                        </span>
                        <div className="border-b border-dashed border-slate-300 pt-8"></div>
                    </div>
                    <div className="space-y-2">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Sign & Stamp
                        </span>
                        <div className="border-b border-dashed border-slate-300 pt-8"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Invoices', href: route('invoices') },
                { title: `Invoice #${invoice.invoice_number}`, href: '#' },
            ]}
        >
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8 print:max-w-none print:p-0">
                {/* Actions Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            asChild
                            className="h-10 gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-600 shadow-sm hover:text-slate-900"
                        >
                            <Link href={route('invoices')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Invoice
                            </p>
                            <h1 className="text-xl font-semibold text-slate-900">
                                #{invoice.invoice_number}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-slate-200 bg-white shadow-sm"
                        >
                            <a
                                href={route('invoices.print', invoice.id)}
                                target="_blank"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </a>
                        </Button>
                        {/* 
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                        */}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] print:grid-cols-2 print:gap-4">
                    {/* Main Invoice Card */}
                    <InvoiceCard className="print:col-span-1 print:shadow-none" />
                    <InvoiceCard className="hidden print:col-span-1 print:block print:shadow-none" />

                    {/* Sidebar / Info */}
                    <div className="space-y-6 print:hidden">
                        {/* Payment History Card */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CreditCard className="h-4 w-4" />
                                    Payment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {invoice.payments &&
                                        invoice.payments.length > 0 ? (
                                            invoice.payments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className="hover:bg-transparent"
                                                >
                                                    <TableCell className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {
                                                                    payment.reference_number
                                                                }
                                                            </span>
                                                            <span className="text-sm font-medium">
                                                                {formatDate(
                                                                    payment.payment_date,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-right font-medium text-emerald-600">
                                                        {formatCurrency(
                                                            payment.amount,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="hover:bg-transparent">
                                                <TableCell
                                                    colSpan={2}
                                                    className="py-6 text-center text-sm text-muted-foreground"
                                                >
                                                    No payments recorded yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            {balance > 0 && (
                                <CardFooter className="bg-slate-50 p-4">
                                    <p className="w-full text-center text-xs text-muted-foreground">
                                        Payments can be recorded via the Billing
                                        Management page.
                                    </p>
                                </CardFooter>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
