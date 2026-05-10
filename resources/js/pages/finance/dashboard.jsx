import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CreditCard, DollarSign, FileSpreadsheet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function FinanceDashboard({ summary, monthlyCollectionSummary = [], zoneRevenueComparison = [] }) {
    const stats = [
        {
            name: 'Total revenue collected',
            value: formatCurrency(summary?.total_revenue_collected ?? 0),
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
        {
            name: 'Outstanding bills',
            value: formatCurrency(summary?.outstanding_bills ?? 0),
            icon: CreditCard,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
        },
        {
            name: 'Overdue bills',
            value: `${(summary?.overdue_bills ?? 0).toLocaleString()}`,
            icon: AlertTriangle,
            color: 'text-amber-700',
            bg: 'bg-amber-100',
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Finance Dashboard', href: '/finance' }]}>
            <Head title="Finance Dashboard" />

            <div className="flex flex-col gap-8 p-4 sm:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold text-slate-900">Finance Overview</h1>
                    <Link
                        href={route('finance.reports.index')}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Revenue Reports
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold">Monthly collection summary</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyCollectionSummary}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Bar dataKey="collected" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold">Zone revenue comparison</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={zoneRevenueComparison} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="zone" tick={{ fontSize: 11 }} width={110} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Bar dataKey="collected" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
