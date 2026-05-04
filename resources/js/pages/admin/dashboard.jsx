import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Building, Droplets, Percent, Receipt, TriangleAlert, TrendingUp, PowerOff } from 'lucide-react';
import DisconnectedCustomersPanel from './components/DisconnectedCustomersPanel';
import NotifiedCustomersPanel from './components/NotifiedCustomersPanel';

/**
 * @returns {Array<{ title: string, description: string, href: string, icon: import('lucide-react').LucideIcon, ring: string, iconBg: string, iconColor: string }>}
 */
function adminQuickLinks() {
    return [
        {
            title: 'Revenue report',
            description: 'Collections, outstanding balances, and period revenue.',
            href: route('reports.revenue'),
            icon: TrendingUp,
            ring: 'ring-emerald-500/15 hover:border-emerald-300/80 dark:hover:border-emerald-700/50',
            iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
            iconColor: 'text-emerald-700 dark:text-emerald-400',
        },
        {
            title: 'Overdue bills',
            description: 'Bills past due date that are still pending or partial.',
            href: route('bills.overdue'),
            icon: TriangleAlert,
            ring: 'ring-amber-500/15 hover:border-amber-300/80 dark:hover:border-amber-700/50',
            iconBg: 'bg-amber-100 dark:bg-amber-950/80',
            iconColor: 'text-amber-800 dark:text-amber-400',
        },
        {
            title: 'Water usage',
            description: 'Consumption by period, zone, and top customers.',
            href: route('reports.water-usage'),
            icon: Droplets,
            ring: 'ring-sky-500/15 hover:border-sky-300/80 dark:hover:border-sky-700/50',
            iconBg: 'bg-sky-100 dark:bg-sky-950/80',
            iconColor: 'text-sky-800 dark:text-sky-400',
        },
        {
            title: 'Departments',
            description: 'Organisation units and department overview.',
            href: route('departments.index'),
            icon: Building,
            ring: 'ring-violet-500/15 hover:border-violet-300/80 dark:hover:border-violet-700/50',
            iconBg: 'bg-violet-100 dark:bg-violet-950/80',
            iconColor: 'text-violet-700 dark:text-violet-300',
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
                <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
                    </div>

                    <div>
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Reports & tools
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-500">Jump to common admin workflows</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        prefetch
                                        className={`group relative flex  gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-transparent transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${item.ring}`}
                                    >
                                        <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 group-hover:opacity-100 dark:text-slate-600 dark:group-hover:text-slate-300" />
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                                        >
                                            <Icon className={`h-5 w-5 ${item.iconColor}`} aria-hidden />
                                        </div>
                                        <div className="min-w-0 pr-6">
                                            <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </header>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue (bills)</h2>
                        </div>
                        <Link href={route('bills.index')} className="text-sm font-medium text-primary hover:underline">
                            View all bills
                        </Link>
                    </div>
                    <p className="mb-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
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
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Paid</p>
                            <p className="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-400">{r.paid ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Unpaid</p>
                            <p className="mt-1 text-2xl font-semibold text-amber-700 dark:text-amber-400">{r.unpaid ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total bills</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{r.total ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Collection rate</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums text-sky-800 dark:text-sky-300">
                                {Number(r.collection_rate_percent ?? 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <NotifiedCustomersPanel notifiedCustomers={notifiedCustomers} />
                    <DisconnectedCustomersPanel disconnectedCustomers={disconnectedCustomers} />

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <PowerOff className="h-5 w-5 text-rose-600" />
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Disconnection summary</h2>
                            </div>
                            <Link
                                href={route('disconnections.index')}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                View disconnections
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Disconnected</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{d.disconnected ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Notified</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{d.notified ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Grace period</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{d.grace_period ?? 0}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Reconnected (month)</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{d.reconnected ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
