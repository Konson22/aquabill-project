import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import ConfirmPaymentModal from './components/confirm-payment-modal';
import { ArrowLeft, CheckCircle2, Printer } from 'lucide-react';

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
 * @param {{ charge: Record<string, unknown> }} props
 */
export default function ServiceChargeShow({ charge }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Service Charges', href: '/service-charges' },
        {
            title: `Charge #${charge.id}`,
            href: route('service-charges.show', charge.id),
        },
    ];

    const isPaid = charge.status === 'paid';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Service charge #${charge.id}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
                <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                        <Link href={route('service-charges.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        {!isPaid && (
                            <Button type="button" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm payment
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm print:shadow-none">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Service charge</p>
                            <h1 className="mt-1 text-2xl font-semibold text-foreground">#{charge.id}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Recorded {formatDisplayDate(charge.created_at)}
                            </p>
                        </div>
                        <Badge variant={isPaid ? 'default' : 'secondary'} className="shrink-0 capitalize">
                            {charge.status}
                        </Badge>
                    </div>

                    <div className="border-b py-5">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                            {formatCurrency(charge.amount)}
                        </p>
                    </div>

                    <dl className="grid gap-4 py-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <dt className="text-muted-foreground">Customer</dt>
                            <dd className="mt-1 font-medium">
                                <Link
                                    href={route('customers.show', charge.customer_id)}
                                    className="text-foreground underline-offset-4 hover:underline"
                                >
                                    {charge.customer?.name}
                                </Link>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Account</dt>
                            <dd className="mt-1 font-mono font-medium">{charge.customer?.account_number ?? '—'}</dd>
                        </div>
                        {charge.customer?.zone?.name ? (
                            <div>
                                <dt className="text-muted-foreground">Zone</dt>
                                <dd className="mt-1 font-medium">{charge.customer.zone.name}</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className="text-muted-foreground">Charge type</dt>
                            <dd className="mt-1 font-medium">{charge.service_charge_type?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Type code</dt>
                            <dd className="mt-1 font-mono text-muted-foreground">
                                {charge.service_charge_type?.code ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Issued by</dt>
                            <dd className="mt-1 font-medium">{charge.issuer?.name ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Issued date</dt>
                            <dd className="mt-1 font-medium">{formatDisplayDate(charge.issued_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Due date</dt>
                            <dd className="mt-1 font-medium">{formatDisplayDate(charge.due_date)}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Last updated</dt>
                            <dd className="mt-1 font-medium">{formatDisplayDate(charge.updated_at)}</dd>
                        </div>
                    </dl>

                    {charge.notes ? (
                        <div className="border-t pt-5">
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{charge.notes}</p>
                        </div>
                    ) : null}
                </div>
            </div>

            <ConfirmPaymentModal
                charge={charge}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </AppLayout>
    );
}
