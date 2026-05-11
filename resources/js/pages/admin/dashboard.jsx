import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    ArrowUpRight,
    Droplets,
    Receipt,
    TriangleAlert,
    TrendingUp,
    Users,
    Bell,
    PowerOff,
    MoreHorizontal
} from 'lucide-react';

/**
 * @returns {Array<{ title: string, description: string, href: string, icon: import('lucide-react').LucideIcon, iconBg: string, iconColor: string }>}
 */
function adminQuickLinks() {
    return [
        {
            title: 'Revenue report',
            description: 'Collections, outstanding balances.',
            href: route('reports.revenue'),
            icon: TrendingUp,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            title: 'Overdue bills',
            description: 'Bills past due date.',
            href: route('bills.overdue'),
            icon: TriangleAlert,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            title: 'Water usage',
            description: 'Consumption by period.',
            href: route('reports.water-usage'),
            icon: Droplets,
            iconBg: 'bg-sky-50',
            iconColor: 'text-sky-600',
        },
    ];
}

function formatShortDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getRemainingDaysText(dateString) {
    if (!dateString) return '';
    const end = new Date(dateString);
    end.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
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

            <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 p-4 sm:p-8 font-sans">
                {/* Top Section */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Stack (1/3) */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        {/* Blue Card */}
                        <div className="flex flex-col justify-between rounded-xl bg-blue-600 p-6 text-white shadow-sm ring-1 ring-blue-700/50 h-[140px]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-100">Total Bills</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                    <Receipt className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="text-4xl font-bold tracking-tight">
                                {r.total ?? 0}
                            </div>
                        </div>

                        {/* Green Card */}
                        <div className="flex flex-col justify-between rounded-xl bg-emerald-400 p-6 text-emerald-950 shadow-sm ring-1 ring-emerald-500/50 h-[140px]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-emerald-800">Collection Rate</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5">
                                    <TrendingUp className="h-4 w-4 text-emerald-900" />
                                </div>
                            </div>
                            <div className="text-4xl font-bold tracking-tight">
                                {Number(r.collection_rate_percent ?? 0).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Right Overview Area (2/3) */}
                    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">System Overview</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">This Month</span>
                                <Button variant="secondary" size="sm" className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200" asChild>
                                    <Link href={route('bills.index')}>View Bills</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Since we don't have a chart, we display the stats beautifully */}
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mt-auto mb-auto">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-500">Paid Bills</span>
                                <span className="text-3xl font-bold text-slate-800">{r.paid ?? 0}</span>
                                <div className="h-1 w-full rounded-full bg-emerald-100 mt-2">
                                    <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${(r.paid / (r.total || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-500">Unpaid Bills</span>
                                <span className="text-3xl font-bold text-slate-800">{r.unpaid ?? 0}</span>
                                <div className="h-1 w-full rounded-full bg-amber-100 mt-2">
                                    <div className="h-1 rounded-full bg-amber-500" style={{ width: `${(r.unpaid / (r.total || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-500">Disconnected</span>
                                <span className="text-3xl font-bold text-slate-800">{d.disconnected ?? 0}</span>
                                <div className="h-1 w-full rounded-full bg-rose-100 mt-2">
                                    <div className="h-1 rounded-full bg-rose-500" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-slate-500">Notified</span>
                                <span className="text-3xl font-bold text-slate-800">{d.notified ?? 0}</span>
                                <div className="h-1 w-full rounded-full bg-indigo-100 mt-2">
                                    <div className="h-1 rounded-full bg-indigo-500" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: 2 Columns */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Column 1: Quick Links */}
                    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-1">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-800">Quick Links</h3>
                            <span className="text-sm font-medium text-blue-600 cursor-pointer">View all</span>
                        </div>
                        <div className="flex flex-col gap-5">
                            {quickLinks.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={i} href={item.href} className="group flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                                                <Icon className={`h-5 w-5 ${item.iconColor}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</span>
                                                <span className="text-xs text-slate-500">{item.description}</span>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-blue-600" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column 2 & 3: Action Required (Notified & Disconnected) */}
                    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-800">Action Required</h3>
                            <Link href="/disconnections" className="text-sm font-medium text-blue-600 hover:underline">View all</Link>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notified Customers</h4>
                            {notifiedCustomers.slice(0, 6).map((row, i) => (
                                <Link key={row.id || i} href={`/customers/${row.customer_id}`} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{row.customer_name ?? 'Unknown'}</span>
                                            <span className="text-xs text-slate-500">{row.account_number ?? '—'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-semibold text-slate-700">{formatShortDate(row.notified_at)}</span>
                                            {row.notice_ends_at && (
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                    getRemainingDaysText(row.notice_ends_at) === 'Overdue' 
                                                        ? 'bg-rose-100 text-rose-700' 
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {getRemainingDaysText(row.notice_ends_at)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                            ))}
                            {notifiedCustomers.length === 0 && (
                                <div className="text-center py-8 text-sm text-slate-500">No notified customers</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

