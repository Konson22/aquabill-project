import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, PowerOff, Printer, User } from 'lucide-react';
import DisconnectionStatusContent from './components/disconnection-status-content';

const SUMMARY_BADGE_CLASS = {
    disconnected: 'border-rose-200/50 bg-rose-500/40 text-white',
    grace: 'border-red-200/50 bg-red-500/35 text-white',
    notice: 'border-amber-200/50 bg-amber-500/35 text-amber-50',
    reconnected: 'border-emerald-200/50 bg-emerald-500/35 text-emerald-50',
    active: 'border-emerald-200/50 bg-emerald-500/35 text-emerald-50',
};

function statusSummary(customer, activeNotice) {
    if (customer?.status === 'disconnected') {
        return { label: 'Disconnected', tone: 'disconnected' };
    }

    if (activeNotice?.status === 'grace_period') {
        return { label: 'Grace period', tone: 'grace' };
    }

    if (activeNotice?.status === 'notified') {
        return { label: '30-day notice', tone: 'notice' };
    }

    const latest = customer?.disconnections?.[0];

    if (customer?.status === 'active' && latest?.status === 'reconnected') {
        return { label: 'Reconnected', tone: 'reconnected' };
    }

    return { label: 'Active service', tone: 'active' };
}

export default function CustomerDisconnectionStatus({ customer }) {
    const disconnections = customer?.disconnections ?? [];
    const activeNotice = disconnections.find((d) => d.status === 'notified' || d.status === 'grace_period');
    const summary = statusSummary(customer, activeNotice);

    const breadcrumbs = [
        { title: 'Customers', href: route('customers.index') },
        {
            title: customer?.account_number ?? 'Customer',
            href: customer ? route('customers.show', customer.id) : route('customers.index'),
        },
        {
            title: 'Disconnection',
            href: customer ? route('customers.disconnection-status', customer.id) : route('customers.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `Disconnection • ${customer.account_number}` : 'Disconnection'} />

            <div className="m-3 flex flex-1 flex-col overflow-hidden rounded-md border bg-card shadow-sm">
                <div className="bg-gradient-to-r from-rose-900 to-rose-800 px-4 py-5 text-white sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={cn('border uppercase tracking-wide', SUMMARY_BADGE_CLASS[summary.tone])}
                                >
                                    {summary.label}
                                </Badge>
                                {customer?.status ? (
                                    <Badge variant="outline" className="border-white/30 bg-white/10 uppercase text-white">
                                        Account {customer.status}
                                    </Badge>
                                ) : null}
                            </div>
                            <h1 className="mt-3 flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
                                <PowerOff className="h-6 w-6 shrink-0 text-rose-200" />
                                Disconnection status
                            </h1>
                            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-rose-100/90">
                                <span className="inline-flex items-center gap-1.5 font-medium text-white">
                                    <User className="h-3.5 w-3.5 opacity-80" />
                                    {customer?.name ?? '—'}
                                </span>
                                {customer?.account_number ? (
                                    <span className="font-mono tabular-nums text-rose-100">{customer.account_number}</span>
                                ) : null}
                                {customer?.zone?.name ? (
                                    <span className="inline-flex items-center gap-1 text-rose-100">
                                        <MapPin className="h-3.5 w-3.5 opacity-80" />
                                        {customer.zone.name}
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-2 max-w-2xl text-xs text-rose-100/80">
                                Issue notices, track the 30-day and 15-day grace timeline, disconnect or reconnect supply, and print formal
                                notices for the customer.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                            >
                                <Link href={route('customers.show', customer.id)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Customer profile
                                </Link>
                            </Button>
                            {activeNotice ? (
                                <Button size="sm" asChild className="bg-white text-rose-900 hover:bg-rose-50">
                                    <a
                                        href={route('customers.print-notification', customer.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print notice
                                    </a>
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <DisconnectionStatusContent customer={customer} />
                </div>
            </div>
        </AppLayout>
    );
}
