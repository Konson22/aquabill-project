import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    Droplets,
    FileText,
    Printer,
    User,
} from 'lucide-react';

export default function PaymentShow({ payment }) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Payments',
            href: route('payments'),
        },
        {
            title: payment.reference_number || 'Payment Details',
            href: '#',
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isBill = payment.payable_type.includes('Bill');
    const payableTypeLabel = isBill ? 'Bill' : 'Invoice';
    const payableNumber = isBill
        ? payment.payable?.bill_number
        : payment.payable?.invoice_number;

    const bill = isBill ? payment.payable : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment ${payment.reference_number || ''}`} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Payment Details
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Transaction Reference:{' '}
                        <span className="font-mono text-foreground">
                            {payment.reference_number || 'N/A'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={route('payments')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Payments
                        </Link>
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                    {isBill && bill && (
                        <Button variant="outline" asChild>
                            <Link href={route('bills.show', bill.id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Original Bill
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Premium Transaction Receipt Card */}
            <Card className="mt-6 overflow-hidden border-none shadow-2xl">
                {/* Visual Accent Top Bar */}
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

                <CardHeader className="bg-slate-50/50 pt-8 pb-8">
                    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                                    <Banknote className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold tracking-widest text-emerald-600 uppercase">
                                        Payment Confirmed
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
                                        {formatCurrency(payment.amount)}
                                    </CardTitle>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className="bg-emerald-500 px-4 py-1 text-sm font-bold text-white shadow-md hover:bg-emerald-600">
                                SUCCESSFUL
                            </Badge>
                            <span className="font-mono text-xs text-slate-400">
                                Ref: {payment.reference_number || 'TRX-N/A'}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Primary Info Grid */}
                    <div className="grid grid-cols-1 divide-y divide-slate-100 border-y border-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                        {/* Column 1: Transaction Meta */}
                        <div className="space-y-6 p-8">
                            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Transaction Meta
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Date
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {formatDate(payment.payment_date)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Method
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="bg-slate-100 font-bold capitalize"
                                    >
                                        {payment.payment_method}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        Agent
                                    </span>
                                    <span className="text-sm font-medium">
                                        {payment.receiver?.name || 'System'}
                                    </span>
                                </div>
                            </div>
                            {payment.notes && (
                                <div className="mt-4 border-t border-dashed pt-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                        Remarks
                                    </p>
                                    <p className="text-sm text-slate-600 italic">
                                        "{payment.notes}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Column 2: Customer & Property */}
                        <div className="space-y-6 bg-slate-50/30 p-8">
                            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Payer Details
                            </h4>
                            {payment.payable?.customer ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg border bg-white p-2 shadow-sm">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {payment.payable.customer.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {payment.payable.customer.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg border bg-white p-2 shadow-sm">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-400 uppercase">
                                                Property Address
                                            </p>
                                            <p className="text-sm leading-tight text-slate-700">
                                                {isBill
                                                    ? bill.home?.address
                                                    : payment.payable.home
                                                          ?.address ||
                                                      'Physical address not set'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">
                                    Customer information unavailable
                                </p>
                            )}
                        </div>

                        {/* Column 3: Allocation Summary */}
                        <div className="space-y-6 p-8">
                            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                                Payment Applied To
                            </h4>
                            <div className="space-y-4">
                                <div className="rounded-xl border-2 border-slate-50 bg-white p-4 shadow-sm ring-1 ring-slate-100">
                                    <div className="mb-2 flex items-center justify-between">
                                        <Badge
                                            variant="outline"
                                            className="border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-700 uppercase"
                                        >
                                            {payableTypeLabel} #{payableNumber}
                                        </Badge>
                                        <Badge
                                            variant={
                                                payment.payable?.status ===
                                                'paid'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-[10px] font-black tracking-tighter uppercase"
                                        >
                                            {payment.payable?.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">
                                                Total Charged
                                            </span>
                                            <span className="font-bold text-slate-700">
                                                {formatCurrency(
                                                    payment.payable
                                                        ?.total_amount ||
                                                        payment.payable?.amount,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-50 pt-2 text-sm">
                                            <span className="font-medium text-slate-900">
                                                Remaining Balance
                                            </span>
                                            <span className="font-black text-rose-500">
                                                {formatCurrency(
                                                    payment.balance !== null
                                                        ? payment.balance
                                                        : payment.payable
                                                              ?.current_balance,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Consumption Area (For Bills Only) */}
                    {isBill && bill && (
                        <div className="relative overflow-hidden bg-slate-900 p-8 text-white">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Droplets className="h-32 w-32" />
                            </div>

                            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                                <Droplets className="h-5 w-5 text-blue-400" />
                                Consumption & Charges Breakdown
                            </h3>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Billing Period
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatDate(bill.billing_period_start)}{' '}
                                        — {formatDate(bill.billing_period_end)}
                                    </p>
                                </div>
                                <div className="space-y-1 text-white">
                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Meter Reading
                                    </p>
                                    <p className="text-sm font-black tracking-wider italic">
                                        {bill.meter_reading?.current_reading} m³
                                        <span className="mx-2 font-normal text-slate-600">
                                            ←
                                        </span>
                                        {bill.meter_reading?.previous_reading}{' '}
                                        m³
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Usage Amount
                                    </p>
                                    <p className="text-2xl font-black text-blue-400">
                                        {bill.consumption}{' '}
                                        <span className="ml-1 text-xs font-bold text-slate-500 uppercase">
                                            Cubic Meters
                                        </span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Tariff Applied
                                    </p>
                                    <p className="text-sm font-bold">
                                        {formatCurrency(bill.tariff)} / m³
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-800 pt-8 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Fixed Charges
                                    </p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(bill.fix_charges)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                                        Previous Arrears
                                    </p>
                                    <p className="text-xl font-bold text-slate-300">
                                        {formatCurrency(bill.previous_balance)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-blue-500/30 bg-blue-900/40 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                                        Current Fresh Charges
                                    </p>
                                    <p className="text-xl font-black text-blue-200">
                                        {formatCurrency(
                                            bill.total_amount -
                                                bill.previous_balance,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                {/* Footer / Printed On Section */}
                <div className="flex flex-col items-center justify-between gap-4 border-t bg-slate-50 p-6 md:flex-row print:hidden">
                    <p className="text-xs font-medium text-slate-400">
                        Processed on {formatDate(new Date())} • This is an
                        official digital receipt.
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.print()}
                            className="text-slate-500 hover:text-slate-900"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Copy
                        </Button>
                    </div>
                </div>
            </Card>
        </AppLayout>
    );
}
