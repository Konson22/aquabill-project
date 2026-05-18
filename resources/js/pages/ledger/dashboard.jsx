import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Droplets, FileText, ClipboardList, MapPin } from 'lucide-react';

function formatCount(value) {
    return Number(value ?? 0).toLocaleString();
}

function formatShortDate(value) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * @param {{
 *   stats?: { unread_meters?: number, bills_generated?: number, active_routes?: number, pending_tasks?: number },
 *   billingCycle?: {
 *     period_start?: string,
 *     period_end?: string,
 *     progress_percent?: number,
 *     status_label?: string,
 *     readings_completed?: number,
 *     readings_total?: number,
 *   },
 * }} props
 */
export default function LedgerDashboard({ stats = {}, billingCycle = {} }) {
    const statCards = [
        {
            name: 'Unread Meters',
            value: formatCount(stats.unread_meters),
            icon: Droplets,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            name: 'Bills Generated',
            value: formatCount(stats.bills_generated),
            icon: FileText,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
        {
            name: 'Active Routes',
            value: formatCount(stats.active_routes),
            icon: MapPin,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            name: 'Pending Tasks',
            value: formatCount(stats.pending_tasks),
            icon: ClipboardList,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
        },
    ];

    const progressPercent = billingCycle.progress_percent ?? 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Ledger Dashboard', href: '/ledger' }]}>
            <Head title="Ledger Dashboard" />

            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Billing & Ledger</h1>
                    <p className="mt-2 text-slate-500">
                        Meter readings and billing cycles.
                        {billingCycle.period_start && billingCycle.period_end ? (
                            <span className="mt-1 block text-sm">
                                Current period: {formatShortDate(billingCycle.period_start)} –{' '}
                                {formatShortDate(billingCycle.period_end)}
                            </span>
                        ) : null}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.name}
                            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
                                </div>
                                <div className={`rounded-xl ${stat.bg} p-3`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href={route('readings.overdue')}
                                className="flex w-full items-center justify-between rounded-xl bg-blue-600 p-4 text-white transition-colors hover:bg-blue-500"
                            >
                                <span className="font-medium">Capture overdue readings</span>
                                <Droplets className="h-5 w-5" />
                            </Link>
                            <Link
                                href={route('bills.index')}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                            >
                                <span className="font-medium">View generated bills</span>
                                <FileText className="h-5 w-5 text-slate-400" />
                            </Link>
                            <Link
                                href={route('zones.index')}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                            >
                                <span className="font-medium">Manage reading routes (zones)</span>
                                <MapPin className="h-5 w-5 text-slate-400" />
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold">Billing Cycle Progress</h2>
                        <div className="relative pt-1">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <span className="inline-block rounded-full bg-blue-200 px-2 py-1 text-xs font-semibold uppercase text-blue-600">
                                        {billingCycle.status_label ?? 'Reading in progress'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block text-xs font-semibold text-blue-600">
                                        {progressPercent}%
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4 flex h-2 overflow-hidden rounded bg-blue-100 text-xs">
                                <div
                                    style={{ width: `${progressPercent}%` }}
                                    className="flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none"
                                />
                            </div>
                            <p className="text-sm text-slate-500">
                                {formatCount(billingCycle.readings_completed)} of{' '}
                                {formatCount(billingCycle.readings_total)} active accounts read this period
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
