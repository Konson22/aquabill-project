import AppLayout from '@/layouts/app-layout';
import ConfirmPaymentModal from './components/confirm-payment-modal';
import { chargeReference, PrintServiceChargeReceipt } from './components/print-service-charge-receipt';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    CreditCard,
    DollarSign,
    MapPin,
    Printer,
    Receipt,
    User,
} from 'lucide-react';
import { useState } from 'react';

/**
 * @param {string | null | undefined} value
 */
function formatDisplayDate(value) {
    if (!value) {
        return '—';
    }

    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            return String(value);
        }

        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

/**
 * @param {{
 *   label: string,
 *   value: import('react').ReactNode,
 *   subValue?: string | null,
 *   icon: import('lucide-react').LucideIcon,
 *   tone?: 'sky' | 'emerald' | 'amber' | 'slate',
 * }} props
 */
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
                    <p className={cn('mt-1 truncate text-lg font-bold tabular-nums', styles.value)}>{value}</p>
                    {subValue ? <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p> : null}
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

/**
 * @param {{ label: string, children: import('react').ReactNode, className?: string }} props
 */
function DetailRow({ label, children, className }) {
    return (
        <div
            className={cn(
                'flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4',
                className,
            )}
        >
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-foreground sm:text-right">{children}</dd>
        </div>
    );
}

/**
 * @param {string | undefined} status
 */
function StatusBadge({ status }) {
    if (status === 'paid') {
        return (
            <Badge className="h-6 border-emerald-200 bg-emerald-50 capitalize text-emerald-800 hover:bg-emerald-50">
                Paid
            </Badge>
        );
    }

    if (status === 'unpaid') {
        return (
            <Badge variant="outline" className="h-6 border-amber-200 bg-amber-50 capitalize text-amber-800">
                Unpaid
            </Badge>
        );
    }

    return <Badge variant="secondary" className="h-6 capitalize">{status ?? '—'}</Badge>;
}

/**
 * @param {{ charge: Record<string, unknown>, stations?: unknown[] }} props
 */
export default function ServiceChargeShow({ charge, stations = [] }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Service charges', href: route('service-charges.index') },
        { title: chargeReference(charge), href: route('service-charges.show', charge.id) },
    ];

    const isPaid = charge.status === 'paid';
    const baseAmount = Number(charge.amount ?? 0);
    const otherCharges = Number(charge.other_charges ?? 0);
    const totalDue = Number(charge.total_due ?? baseAmount + otherCharges);
    const payments = Array.isArray(charge.payments) ? charge.payments : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service charge ${chargeReference(charge)}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
                <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                        <Link href={route('service-charges.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to service charges
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={route('service-charges.print', charge.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print receipt
                            </a>
                        </Button>
                        {!isPaid && (
                            <Button
                                size="sm"
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => setIsPaymentModalOpen(true)}
                            >
                                <DollarSign className="h-4 w-4" />
                                Confirm payment
                            </Button>
                        )}
                    </div>
                </div>

                <div className="no-print overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-sky-800 px-5 py-5 text-white sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-sky-100/90">
                                    Service charge
                                </p>
                                <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                                    {chargeReference(charge)}
                                </h1>
                                <p className="text-sm text-sky-100/90">
                                    Issued {formatDisplayDate(charge.issued_date)}
                                    {charge.issuer?.name ? (
                                        <span> · by {charge.issuer.name}</span>
                                    ) : null}
                                </p>
                            </div>
                            <StatusBadge status={charge.status} />
                        </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryStat
                                label="Total due"
                                value={formatCurrency(totalDue)}
                                subValue={charge.service_charge_type?.name ?? null}
                                icon={Receipt}
                                tone="sky"
                            />
                            <SummaryStat
                                label="Base amount"
                                value={formatCurrency(baseAmount)}
                                subValue={charge.service_charge_type?.code ?? null}
                                icon={CreditCard}
                                tone="slate"
                            />
                            <SummaryStat
                                label="Status"
                                value={isPaid ? 'Paid' : 'Unpaid'}
                                subValue={
                                    isPaid
                                        ? payments.length
                                            ? `${payments.length} payment(s)`
                                            : 'Settled'
                                        : 'Awaiting payment'
                                }
                                icon={isPaid ? CheckCircle2 : DollarSign}
                                tone={isPaid ? 'emerald' : 'amber'}
                            />
                            <SummaryStat
                                label="Issued"
                                value={formatDisplayDate(charge.issued_date)}
                                subValue={charge.due_date ? `Due ${formatDisplayDate(charge.due_date)}` : null}
                                icon={Calendar}
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
                                                href={route('customers.show', charge.customer_id)}
                                                className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
                                            >
                                                {charge.customer?.name ?? '—'}
                                            </Link>
                                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                                                {charge.customer?.account_number ?? '—'}
                                            </p>
                                        </div>
                                        {charge.customer?.zone?.name ? (
                                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                {charge.customer.zone.name}
                                            </p>
                                        ) : null}
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
                                        <DetailRow label="Issued">{formatDisplayDate(charge.issued_date)}</DetailRow>
                                        <DetailRow label="Due">{formatDisplayDate(charge.due_date)}</DetailRow>
                                        <DetailRow label="Recorded">{formatDisplayDate(charge.created_at)}</DetailRow>
                                        <DetailRow label="Last updated">{formatDisplayDate(charge.updated_at)}</DetailRow>
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
                                                    <tr className="border-b bg-muted/40 text-left text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        <th className="px-4 py-3">Description</th>
                                                        <th className="px-4 py-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    <tr>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium">
                                                                {charge.service_charge_type?.name ?? 'Service charge'}
                                                            </p>
                                                            {charge.service_charge_type?.code ? (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {charge.service_charge_type.code}
                                                                </p>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                                            {formatCurrency(baseAmount)}
                                                        </td>
                                                    </tr>
                                                    {otherCharges > 0 ? (
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium">Other charges</td>
                                                            <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                                                                {formatCurrency(otherCharges)}
                                                            </td>
                                                        </tr>
                                                    ) : null}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-6 flex items-end justify-between gap-4 border-t border-foreground/20 pt-4">
                                            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Total due
                                            </p>
                                            <p className="font-mono text-2xl font-bold tabular-nums tracking-tight">
                                                {formatCurrency(totalDue)}
                                            </p>
                                        </div>

                                        <dl className="mt-6 space-y-2 border-t pt-4 text-sm">
                                            <DetailRow label="Issued by">{charge.issuer?.name ?? '—'}</DetailRow>
                                            <DetailRow label="Charge ID">
                                                <span className="font-mono">{chargeReference(charge)}</span>
                                            </DetailRow>
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
                                                <tr className="border-b bg-muted/40 text-left text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
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
                                                        <td className="px-4 py-3 capitalize">
                                                            {payment.payment_method?.replace(/_/g, ' ') ?? '—'}
                                                        </td>
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

                        {charge.notes ? (
                            <Card className="border-border/60 shadow-none">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                        {charge.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </div>

                <div className="hidden print:block">
                    <PrintServiceChargeReceipt charge={charge} />
                </div>
            </div>

            <ConfirmPaymentModal
                charge={charge}
                stations={stations}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </AppLayout>
    );
}
