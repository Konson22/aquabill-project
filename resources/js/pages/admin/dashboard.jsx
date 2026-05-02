import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Building, Droplets, TriangleAlert, TrendingUp, PowerOff, ChevronRight } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DisconnectedCustomersPanel from './components/DisconnectedCustomersPanel';
import NotifiedCustomersPanel from './components/NotifiedCustomersPanel';

function formatMoney(value) {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) {
        return 'SSP 0';
    }

    return `SSP ${number.toLocaleString()}`;
}

const stats = [
    { name: 'Revenue Report', value: 'View', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-100', href: '/reports/revenue' },
    { name: 'Overdue Bills', value: 'View', icon: TriangleAlert, color: 'text-amber-700', bg: 'bg-amber-100', href: '/bills/overdue-bills' },
    { name: 'Water Usage Report', value: 'View', icon: Droplets, color: 'text-cyan-700', bg: 'bg-cyan-100', href: '/reports/water-usage' },
    { name: 'Departments', value: '5', icon: Building, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/departments' },
];

export default function AdminDashboard({
    disconnectionStats = {},
    notifiedCustomers = [],
    disconnectedCustomers = [],
    monthlyPayments = [],
    paymentChartYear,
}) {
    const d = disconnectionStats;
    const chartYear = paymentChartYear ?? new Date().getFullYear();

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin' }]}>
            <Head title="Admin Dashboard" />
            
            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Control Center</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">System-wide monitoring and configuration.</p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <PowerOff className="h-5 w-5 text-rose-600" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Disconnection summary</h2>
                        </div>
                        <Link
                            href="/disconnections"
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

                <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-9">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payments by month</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Total payments recorded in {chartYear} (all 12 months; empty months show 0).
                            </p>
                        </div>
                        <div className="h-[min(22rem,50vh)] w-full min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyPayments} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        className="stroke-slate-200 dark:stroke-slate-700"
                                    />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={48}
                                        tickFormatter={(v) =>
                                            v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatMoney(value), 'Paid']}
                                        labelFormatter={(label) => `${label} ${chartYear}`}
                                        contentStyle={{ borderRadius: '8px' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        name="Payments"
                                        fill="rgb(59 130 246)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Reports & resources</h2>
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-800/30">
                                {stats.map((stat, i) => (
                                    <Link
                                        key={stat.name}
                                        href={stat.href}
                                        className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white dark:hover:bg-slate-900/90 ${
                                            i > 0 ? 'border-t border-slate-200 dark:border-slate-800' : ''
                                        }`}
                                    >
                                        <div
                                            className={`shrink-0 rounded-lg p-2 transition-transform group-hover:scale-[1.02] ${stat.bg}`}
                                        >
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{stat.name}</p>
                                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                {stat.value === 'View' ? 'Open report' : stat.value}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:text-slate-600" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <NotifiedCustomersPanel notifiedCustomers={notifiedCustomers} />
                    <DisconnectedCustomersPanel disconnectedCustomers={disconnectedCustomers} />
                </div>
            </div>
        </AppLayout>
    );
}
