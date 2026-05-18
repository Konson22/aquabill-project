import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Bell, Calendar, Clock, ClipboardList, PowerOff, Receipt, TrendingUp, TriangleAlert } from 'lucide-react';
import RevenueOverviewSection from './components/revenue-overview-section';
import { getRemainingDaysText } from './components/get-remaining-days-text';

/**
 * @param {{ notified?: number, disconnected?: number, grace_period?: number }} disconnectionStats
 * @param {{ overdue_bills?: number, overdue_readings?: number }} quickLinkCounts
 */
function adminQuickLinks(disconnectionStats = {}, quickLinkCounts = {}) {
    const notified = disconnectionStats.notified ?? 0;
    const disconnected = disconnectionStats.disconnected ?? 0;
    const gracePeriod = disconnectionStats.grace_period ?? 0;
    const overdueBills = quickLinkCounts.overdue_bills ?? 0;
    const overdueReadings = quickLinkCounts.overdue_readings ?? 0;

    return [
        {
            title: 'Overdue bills',
            count: overdueBills,
            description: `${overdueBills} bill${overdueBills === 1 ? '' : 's'} past due date`,
            href: route('bills.overdue'),
            icon: TriangleAlert,
            iconBg: 'bg-orange-400/50',
            iconColor: 'text-white',
            countClass: 'bg-orange-400 text-white',
            cardClass: 'bg-orange-500 ring-orange-400/60 hover:bg-orange-500 hover:ring-orange-400',
            titleClass: 'text-white',
            descClass: 'text-orange-50/95',
        },
        {
            title: 'Overdue readings',
            count: overdueReadings,
            description: `${overdueReadings} customer${overdueReadings === 1 ? '' : 's'} missing a reading this month`,
            href: route('readings.overdue'),
            icon: ClipboardList,
            iconBg: 'bg-sky-400/50',
            iconColor: 'text-white',
            countClass: 'bg-sky-400 text-white',
            cardClass: 'bg-sky-500 ring-sky-400/60 hover:bg-sky-500 hover:ring-sky-400',
            titleClass: 'text-white',
            descClass: 'text-sky-50/95',
        },
        {
            title: 'Notified',
            count: notified,
            description:
                gracePeriod > 0
                    ? `On disconnection notice · ${gracePeriod} in grace period`
                    : 'Customers on disconnection notice',
            href: route('disconnections.index'),
            icon: Bell,
            iconBg: 'bg-blue-400/50',
            iconColor: 'text-white',
            countClass: 'bg-blue-400 text-white',
            cardClass: 'bg-blue-500 ring-blue-400/60 hover:bg-blue-500 hover:ring-blue-400',
            titleClass: 'text-white',
            descClass: 'text-blue-50/95',
        },
        {
            title: 'Disconnected',
            count: disconnected,
            description: 'Customers currently disconnected',
            href: route('disconnections.index'),
            icon: PowerOff,
            iconBg: 'bg-fuchsia-400/50',
            iconColor: 'text-white',
            countClass: 'bg-fuchsia-400 text-white',
            cardClass: 'bg-fuchsia-500 ring-fuchsia-400/60 hover:bg-fuchsia-500 hover:ring-fuchsia-400',
            titleClass: 'text-white',
            descClass: 'text-fuchsia-50/95',
        },
    ];
}

function formatShortDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ordinalDay(day) {
    const value = Number(day);
    if (!Number.isFinite(value) || value < 1) {
        return '—';
    }

    const mod100 = value % 100;
    const suffix =
        mod100 >= 11 && mod100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][value % 10];

    return `${value}${suffix}`;
}

function percent(part, whole) {
    if (!whole || whole <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((part / whole) * 100));
}

function OverviewMetric({ label, value, percent: barPercent, barClass, href, icon: Icon, iconClass }) {
    const content = (
        <Card className="h-full border-slate-200/80 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/50">
            <CardContent className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
                    </div>
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconClass)}>
                        <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                </div>
                <div className="mt-auto space-y-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={cn('h-full rounded-full transition-all', barClass)} style={{ width: `${barPercent}%` }} />
                    </div>
                    <p className="text-[10px] font-medium tabular-nums text-muted-foreground">{barPercent}% of bills</p>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {content}
            </Link>
        );
    }

    return content;
}

function ConnectionMetric({ label, value, sharePercent, barClass, href, icon: Icon, iconClass }) {
    const inner = (
        <>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
                </div>
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconClass)}>
                    <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
            </div>
            <div className="mt-3 space-y-1.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', barClass)} style={{ width: `${sharePercent}%` }} />
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Share of active notices</p>
            </div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-card p-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {inner}
            </Link>
        );
    }

    return <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-card p-4 shadow-sm">{inner}</div>;
}

export default function AdminDashboard({
    disconnectionStats = {},
    quickLinkCounts = {},
    notifiedCustomers = [],
    revenueBillCounts = { paid: 0, unpaid: 0, total: 0, collection_rate_percent: 0 },
    billingCycle = {},
    chartData = [],
    zoneRevenueComparison = [],
}) {
    const d = disconnectionStats;
    const r = revenueBillCounts;
    const quickLinks = adminQuickLinks(d, quickLinkCounts);

    const total = r.total ?? 0;
    const paid = r.paid ?? 0;
    const unpaid = r.unpaid ?? 0;
    const collectionRate = Number(r.collection_rate_percent ?? 0);
    const disconnected = d.disconnected ?? 0;
    const notified = d.notified ?? 0;
    const gracePeriod = d.grace_period ?? 0;
    const connectionActive = disconnected + notified + gracePeriod;
    const disconnectedShare = connectionActive ? percent(disconnected, connectionActive) : 0;
    const cyclePeriodEnd = billingCycle.period_end ?? null;
    const cyclePeriodStart = billingCycle.period_start ?? null;
    const cycleCloseDay = billingCycle.billing_cycle_day ?? null;
    const cycleRemainingText = getRemainingDaysText(cyclePeriodEnd);

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin Dashboard', href: '/admin' }]}>
            <Head title="Admin Dashboard" />

            <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 p-4 font-sans sm:p-8">
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'group flex min-h-[88px] items-center rounded-xl p-4 text-white shadow-sm ring-1 transition-all hover:shadow-md',
                                    item.cardClass,
                                )}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                            item.iconBg,
                                        )}
                                    >
                                        <Icon className={cn('h-5 w-5', item.iconColor)} />
                                    </div>
                                    <div className="min-w-0 flex flex-col gap-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={cn('text-sm font-bold', item.titleClass)}>{item.title}</span>
                                            <span
                                                className={cn(
                                                    'inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums',
                                                    item.countClass,
                                                )}
                                            >
                                                {item.count}
                                            </span>
                                        </div>
                                        <span className={cn('line-clamp-2 text-xs leading-snug', item.descClass)}>
                                            {item.description}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    <div className="group flex min-h-[132px] flex-col justify-between rounded-xl bg-violet-600 p-5 text-white shadow-sm ring-1 ring-violet-700/40">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-violet-100">Cycle billing date</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tabular-nums tracking-tight">
                                {cyclePeriodEnd ? formatShortDate(cyclePeriodEnd) : '—'}
                            </p>
                            <p className="mt-1 text-xs text-violet-100/90">
                                {cycleCloseDay ? `Closes ${ordinalDay(cycleCloseDay)} monthly` : 'Cycle close not set'}
                                {cyclePeriodStart && cyclePeriodEnd
                                    ? ` · ${formatShortDate(cyclePeriodStart)} – ${formatShortDate(cyclePeriodEnd)}`
                                    : ''}
                            </p>
                            {cycleRemainingText ? (
                                <p className="mt-1 text-xs font-medium text-violet-50">{cycleRemainingText}</p>
                            ) : null}
                        </div>
                    </div>

                    <Link
                        href={route('bills.index')}
                        className="group flex min-h-[132px] flex-col justify-between rounded-xl bg-blue-600 p-5 text-white shadow-sm ring-1 ring-blue-700/40 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-100">Total bills</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                                <Receipt className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tabular-nums tracking-tight">{total.toLocaleString()}</p>
                            <p className="mt-1 text-xs text-blue-100/90">Issued this month</p>
                        </div>
                    </Link>

                    <Link
                        href={route('bills.index')}
                        className="group flex min-h-[132px] flex-col justify-between rounded-xl bg-emerald-600 p-5 text-white shadow-sm ring-1 ring-emerald-700/40 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-100">Collection rate</span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <p className="text-4xl font-bold tabular-nums tracking-tight">{collectionRate.toFixed(1)}%</p>
                            <p className="mt-1 text-xs text-emerald-100/90">
                                {paid.toLocaleString()} paid · {unpaid.toLocaleString()} outstanding
                            </p>
                        </div>
                    </Link>
                    <OverviewMetric
                        label="Paid bills"
                        value={paid.toLocaleString()}
                        percent={percent(paid, total)}
                        barClass="bg-emerald-500"
                        href={route('bills.index')}
                        icon={Receipt}
                        iconClass="bg-emerald-100 text-emerald-700"
                    />
                    
                </div>
                {gracePeriod > 0 ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            <span className="font-semibold tabular-nums">{gracePeriod}</span> customer
                            {gracePeriod === 1 ? '' : 's'} in 15-day grace period
                        </span>
                    </div>
                ) : null}

                <RevenueOverviewSection chartData={chartData} zoneRevenueComparison={zoneRevenueComparison} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-800">Action Required</h3>
                            <Link
                                href={route('disconnections.index')}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="flex flex-col gap-5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Notified Customers
                            </h4>
                            {notifiedCustomers.slice(0, 6).map((row, i) => (
                                <Link
                                    key={row.id || i}
                                    href={route('customers.show', row.customer_id)}
                                    className="group flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="line-clamp-1 text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                                                {row.customer_name ?? 'Unknown'}
                                            </span>
                                            <span className="text-xs text-slate-500">{row.account_number ?? '—'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-semibold text-slate-700">
                                            {formatShortDate(row.notified_at)}
                                        </span>
                                        {row.notice_ends_at ? (
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                                    getRemainingDaysText(row.notice_ends_at) === 'Overdue'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-amber-100 text-amber-700',
                                                )}
                                            >
                                                {getRemainingDaysText(row.notice_ends_at)}
                                            </span>
                                        ) : null}
                                    </div>
                                </Link>
                            ))}
                            {notifiedCustomers.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">No notified customers</div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
