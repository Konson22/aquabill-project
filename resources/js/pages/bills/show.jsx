import PaymentModal from '@/components/payment-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn, formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    DollarSign,
    Droplets,
    Gauge,
    MapPin,
    Printer,
    Receipt,
    User,
} from 'lucide-react';
import { useMemo, useState } from 'react';

function formatDisplayDate(value) {
    if (!value) {
        return '—';
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

function billLabel(bill) {
    const raw = bill?.bill_no ?? bill?.id;

    return `#${String(raw).padStart(6, '0')}`;
}

function statusVariant(status) {
    if (status === 'paid') {
        return 'success';
    }

    if (status === 'pending') {
        return 'destructive';
    }

    return 'outline';
}

function canRecordPayment(status) {
    return status === 'pending';
}

function SummaryStat({ label, value, subValue, icon: Icon, tone = 'sky' }) {
    const tones = {
        sky: {
            card: 'border-sky-100 bg-sky-50/80',
            icon: 'bg-sky-100 text-sky-700',
            value: 'text-sky-950',
        },
        emerald: {
            card: 'border-emerald-100 bg-emerald-50/80',
            icon: 'bg-emerald-100 text-emerald-700',
            value: 'text-emerald-950',
        },
        amber: {
            card: 'border-amber-100 bg-amber-50/80',
            icon: 'bg-amber-100 text-amber-700',
            value: 'text-amber-950',
        },
        slate: {
            card: 'border-slate-200 bg-slate-50/80',
            icon: 'bg-slate-100 text-slate-700',
            value: 'text-slate-950',
        },
    };

    const styles = tones[tone] ?? tones.sky;

    return (
        <div className={cn('rounded-xl border p-4 shadow-sm', styles.card)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className={cn('mt-1 truncate font-mono text-lg font-bold tabular-nums', styles.value)}>{value}</p>
                    {subValue ? <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p> : null}
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, children, className }) {
    return (
        <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4', className)}>
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-foreground sm:text-right">{children}</dd>
        </div>
    );
}

export default function Show({ bill, stations = [] }) {
    const [paymentOpen, setPaymentOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Billing & invoices', href: route('bills.index') },
        { title: billLabel(bill), href: route('bills.show', bill.id) },
    ];

    const totalAmount = Number(bill?.total_amount ?? 0);
    const amountPaid = Number(bill?.amount_paid ?? 0);
    const balanceDue = Math.max(0, totalAmount - amountPaid);
    const consumptionCharge = Number(bill?.consumption ?? 0) * Number(bill?.unit_price ?? 0);
    const payments = Array.isArray(bill?.payments) ? bill.payments : [];

    const isOverdue = useMemo(() => {
        if (!['pending', 'partial'].includes(bill?.status) || !bill?.due_date) {
            return false;
        }

        const due = new Date(bill.due_date);
        due.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return due < today;
    }, [bill?.status, bill?.due_date]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bill ${billLabel(bill)}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
                <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                        <Link href={route('bills.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to billing
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route('bills.print', bill.id)} target="_blank" rel="noopener noreferrer">
                                <Printer className="mr-2 h-4 w-4" />
                                Print invoice
                            </a>
                        </Button>
                        {canRecordPayment(bill.status) && (
                            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => setPaymentOpen(true)}>
                                <DollarSign className="h-4 w-4" />
                                Record payment
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-sky-800 px-5 py-5 text-white sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-sky-100/90">Water bill</p>
                                <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">{billLabel(bill)}</h1>
                                <p className="text-sm text-sky-100/90">
                                    Issued {formatDisplayDate(bill.created_at)}
                                    {bill.reading?.recorder?.name ? (
                                        <span> · by {bill.reading.recorder.name}</span>
                                    ) : null}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={statusVariant(bill.status)} className="h-6 capitalize">
                                    {bill.status}
                                </Badge>
                                {isOverdue ? (
                                    <Badge variant="destructive" className="h-6 uppercase text-[10px] tracking-wide">
                                        Overdue
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryStat
                                label="Total due"
                                value={formatCurrency(totalAmount)}
                                subValue={`Due ${formatDisplayDate(bill.due_date)}`}
                                icon={Receipt}
                                tone="sky"
                            />
                            <SummaryStat
                                label="Paid"
                                value={formatCurrency(amountPaid)}
                                subValue={payments.length ? `${payments.length} payment(s)` : 'No payments yet'}
                                icon={DollarSign}
                                tone="emerald"
                            />
                            <SummaryStat
                                label="Balance"
                                value={formatCurrency(balanceDue)}
                                subValue={balanceDue > 0 ? 'Outstanding' : 'Settled'}
                                icon={Activity}
                                tone={balanceDue > 0 ? 'amber' : 'emerald'}
                            />
                            <SummaryStat
                                label="Consumption"
                                value={`${bill.consumption ?? 0} m³`}
                                subValue={bill.meter?.meter_number ? `Meter ${bill.meter.meter_number}` : null}
                                icon={Droplets}
                                tone="slate"
                            />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-5">
                            <div className="space-y-6 lg:col-span-2">
                                <Card className="border-border/60 shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <User className="h-4 w-4 text-sky-600" />
                                            Customer
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0">
                                        <div>
                                            <Link
                                                href={route('customers.show', bill.customer_id)}
                                                className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
                                            >
                                                {bill.customer?.name ?? '—'}
                                            </Link>
                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {bill.customer?.account_number ?? '—'}
                                            </p>
                                        </div>
                                        {bill.customer?.zone?.name ? (
                                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                {bill.customer.zone.name}
                                            </p>
                                        ) : null}
                                        {bill.customer?.tariff?.name ? (
                                            <p className="text-sm text-muted-foreground">
                                                Tariff: <span className="font-medium text-foreground">{bill.customer.tariff.name}</span>
                                            </p>
                                        ) : null}
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60 shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <Gauge className="h-4 w-4 text-sky-600" />
                                            Meter & reading
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0 text-sm">
                                        <DetailRow label="Meter">{bill.meter?.meter_number ?? bill.meter_number ?? '—'}</DetailRow>
                                        {bill.meter?.meter_type ? (
                                            <DetailRow label="Type">{bill.meter.meter_type}</DetailRow>
                                        ) : null}
                                        <DetailRow label="Previous">{bill.reading?.previous_reading ?? '—'} m³</DetailRow>
                                        <DetailRow label="Current">{bill.reading?.current_reading ?? '—'} m³</DetailRow>
                                        <DetailRow label="Reading date">{formatDisplayDate(bill.reading?.reading_date)}</DetailRow>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60 shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                            <Calendar className="h-4 w-4 text-sky-600" />
                                            Dates
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pt-0 text-sm">
                                        <DetailRow label="Issued">{formatDisplayDate(bill.created_at)}</DetailRow>
                                        <DetailRow label="Due">
                                            <span className={cn(isOverdue && 'font-semibold text-destructive')}>
                                                {formatDisplayDate(bill.due_date)}
                                            </span>
                                        </DetailRow>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-3">
                                <Card className="h-full border-border/60 shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-semibold">Charge breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="overflow-x-auto rounded-lg border">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                        <th className="px-4 py-3">Description</th>
                                                        <th className="px-4 py-3 text-right">Qty</th>
                                                        <th className="px-4 py-3 text-right">Rate</th>
                                                        <th className="px-4 py-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium">Water consumption</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono tabular-nums">{bill.consumption} m³</td>
                                                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                                                            {formatCurrency(bill.unit_price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                                            {formatCurrency(consumptionCharge)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium">Fixed service charge</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono tabular-nums">1</td>
                                                        <td className="px-4 py-3 text-right font-mono tabular-nums">
                                                            {formatCurrency(bill.fixed_charge)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                                            {formatCurrency(bill.fixed_charge)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <dl className="mt-6 space-y-2 border-t pt-4 text-sm">
                                            <DetailRow label="Current charges">{formatCurrency(bill.current_charge)}</DetailRow>
                                            <DetailRow label="Previous balance (arrears)">
                                                <span
                                                    className={cn(
                                                        'font-mono tabular-nums',
                                                        Number(bill.previous_balance) > 0 && 'text-destructive',
                                                    )}
                                                >
                                                    {formatCurrency(bill.previous_balance)}
                                                </span>
                                            </DetailRow>
                                            <div className="flex items-end justify-between gap-4 border-t border-foreground/20 pt-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        Total amount due
                                                    </p>
                                                </div>
                                                <p className="font-mono text-2xl font-bold tabular-nums tracking-tight">
                                                    {formatCurrency(totalAmount)}
                                                </p>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {payments.length > 0 ? (
                            <Card className="border-border/60 shadow-none">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Payment history</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="overflow-x-auto rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Method</th>
                                                    <th className="px-4 py-3 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {payments.map((payment) => (
                                                    <tr key={payment.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                                                            {formatDisplayDate(payment.payment_date)}
                                                        </td>
                                                        <td className="px-4 py-3 capitalize">{payment.payment_method?.replace('_', ' ') ?? '—'}</td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                                            {formatCurrency(payment.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </div>
            </div>

            <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} bill={bill} stations={stations} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </AppLayout>
    );
}
