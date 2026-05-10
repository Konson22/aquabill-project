import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Building, Droplets, Percent, Receipt, TriangleAlert, TrendingUp, PowerOff } from 'lucide-react';
import DisconnectedCustomersPanel from './components/DisconnectedCustomersPanel';
import NotifiedCustomersPanel from './components/NotifiedCustomersPanel';

/**
 * @returns {Array<{ title: string, description: string, href: string, icon: import('lucide-react').LucideIcon, ring: string, cardBg: string, iconBg: string, iconColor: string }>}
 */
function adminQuickLinks() {
    return [
        {
            title: 'Revenue report',
            description: 'Collections, outstanding balances, and period revenue.',
            href: route('reports.revenue'),
            icon: TrendingUp,
            ring: 'ring-emerald-500/15 hover:border-emerald-300/80',
            cardBg: 'bg-emerald-500',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-700',
        },
        {
            title: 'Overdue bills',
            description: 'Bills past due date that are still pending or partial.',
            href: route('bills.overdue'),
            icon: TriangleAlert,
            ring: 'ring-amber-500/15 hover:border-amber-300/80',
            cardBg: 'bg-amber-500',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-800',
        },
        {
            title: 'Water usage',
            description: 'Consumption by period, zone, and top customers.',
            href: route('reports.water-usage'),
            icon: Droplets,
            ring: 'ring-sky-500/15 hover:border-sky-300/80',
            cardBg: 'bg-sky-500',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-800',
        },
        {
            title: 'Departments',
            description: 'Organisation units and department overview.',
            href: route('departments.index'),
            icon: Building,
            ring: 'ring-violet-500/15 hover:border-violet-300/80',
            cardBg: 'bg-violet-500',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-700',
        },
    ];
}

export default function AdminDashboard({
    disconnectionStats = {},
    notifiedCustomers = [],
    disconnectedCustomers = [],
    revenueBillCounts = { paid: 0, unpaid: 0, total: 0, collection_rate_percent: 0 },
}) {
    const d = disconnectionStats;
    const r = revenueBillCounts;
    const quickLinks = adminQuickLinks();

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin' }]}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <header className="flex flex-col gap-6 border-b border-slate-200 pb-8">

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {quickLinks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className={`group relative flex gap-3 rounded-md border border-slate-200 p-4 shadow-sm ring-1 ring-transparent transition-all hover:shadow-md ${item.cardBg} ${item.ring}`}
                                >
                                    <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 group-hover:opacity-100" />
                                    <div className="min-w-0 pr-6">
                                        <p className="font-semibold text-white">{item.title}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-white/85">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div
                                        className={`ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                                    >
                                        <Icon className={`h-5 w-5 ${item.iconColor}`} aria-hidden />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </header>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-slate-900">Revenue (bills)</h2>
                        </div>
                        <Link href={route('bills.index')} className="text-sm font-medium text-primary hover:underline">
                            View all bills
                        </Link>
                    </div>
                    <p className="mb-4 space-y-1 text-sm text-slate-500">
                        <span className="block">
                            Bill counts by settlement status (paid vs open: pending, partial, or forwarded).
                        </span>
                        <span className="flex items-start gap-1.5 text-xs leading-relaxed">
                            <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                            <span>
                                Collection rate matches the revenue report: (payments on all bills + paid service
                                charges) ÷ (sum of usage charges and fixed fees billed on all bills), lifetime.
                            </span>
                        </span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Paid</p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-700">{r.paid ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Unpaid</p>
                            <p className="mt-1 text-2xl font-semibold text-amber-700">{r.unpaid ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total bills</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900">{r.total ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Collection rate</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-800">
                                {Number(r.collection_rate_percent ?? 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <NotifiedCustomersPanel notifiedCustomers={notifiedCustomers} />
                    <DisconnectedCustomersPanel disconnectedCustomers={disconnectedCustomers} />

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <PowerOff className="h-5 w-5 text-rose-600" />
                                <h2 className="text-lg font-semibold text-slate-900">Disconnection summary</h2>
                            </div>
                            <Link
                                href={route('disconnections.index')}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                View disconnections
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Disconnected</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{d.disconnected ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notified</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{d.notified ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Grace period</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{d.grace_period ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reconnected (month)</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900">{d.reconnected ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
