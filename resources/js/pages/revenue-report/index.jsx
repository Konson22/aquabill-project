import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { RevenueSummaryTable } from '@/components/reports/revenue-summary-table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RevenueCharts } from '@/components/reports/revenue-charts';
import { RevenueMonthlyBreakdownTable } from '@/components/reports/revenue-monthly-breakdown-table';
import { Head, Link, router } from '@inertiajs/react';
import { Banknote, BarChart3, FileSpreadsheet, PieChart, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';

const reportHref = () => route('revenue-report.index');

const breadcrumbs = [
    {
        title: 'Revenue report',
        href: reportHref(),
    },
];

/**
 * @param {Date} [d]
 * @returns {{ from: string, to: string }}
 */
function calendarFullYearBounds(d = new Date()) {
    const y = d.getFullYear();

    return { from: `${y}-01-01`, to: `${y}-12-31` };
}

/**
 * @param {{ from?: string, to?: string }} f
 */
function initialBillMonthRange(f) {
    const from = f.from?.trim() ?? '';
    const to = f.to?.trim() ?? '';
    if (from && to) {
        return { from, to };
    }

    return calendarFullYearBounds();
}

function toStringId(value) {
    return value != null && value !== '' ? String(value) : 'all';
}

export default function RevenueReport({
    summary,
    chartData = [],
    filters,
    zoneRevenueComparison = [],
    financeFilters,
    filterOptions,
    monthlyBreakdown = [],
    monthlyBreakdownYear,
}) {
    const safeSummary = summary ?? {
        total_revenue: 0,
        total_revenue_paid: 0,
        total_revenue_unpaid: 0,
        fixed_charge_revenue: 0,
        fixed_charge_paid: 0,
        fixed_charge_unpaid: 0,
        service_charges_revenue: 0,
        service_charges_paid: 0,
        service_charges_unpaid: 0,
        total_billed_revenue: 0,
        total_paid: 0,
        total_outstanding: 0,
        collection_rate_percent: 0,
        payments_count: 0,
        total_bills_generated: 0,
        bills_paid_count: 0,
        bills_pending_count: 0,
        bills_forwarded_count: 0,
    };

    const safeFilters = filters ?? { search: '', from: '', to: '' };

    const [from, setFrom] = useState(() => initialBillMonthRange(filters ?? { from: '', to: '' }).from);
    const [to, setTo] = useState(() => initialBillMonthRange(filters ?? { from: '', to: '' }).to);

    const [paymentFrom, setPaymentFrom] = useState(financeFilters?.from ?? '');
    const [paymentTo, setPaymentTo] = useState(financeFilters?.to ?? '');
    const [stationId, setStationId] = useState(toStringId(financeFilters?.station_id));

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                reportHref(),
                {
                    from: from || undefined,
                    to: to || undefined,
                    search: filters?.search?.trim() || undefined,
                    pf_from: paymentFrom || undefined,
                    pf_to: paymentTo || undefined,
                    station_id: stationId === 'all' ? undefined : stationId,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: [
                        'summary',
                        'filters',
                        'chartData',
                        'zoneRevenueComparison',
                        'financeFilters',
                        'filterOptions',
                        'monthlyBreakdown',
                        'monthlyBreakdownYear',
                    ],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [from, to, paymentFrom, paymentTo, stationId, filters?.search]);

    const excelExportHref = route('revenue-report.export', {
        from: from || undefined,
        to: to || undefined,
        search: safeFilters.search || undefined,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue report" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                    <div className="flex items-center gap-2 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="payment-from">
                            From
                        </label>
                        <Input
                            id="payment-from"
                            type="date"
                            value={paymentFrom}
                            onChange={(e) => setPaymentFrom(e.target.value)}
                            className="h-9 min-w-0 bg-background"
                        />
                    </div>
                    <div className="flex items-center gap-2 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground" htmlFor="payment-to">
                            To
                        </label>
                        <Input
                            id="payment-to"
                            type="date"
                            value={paymentTo}
                            onChange={(e) => setPaymentTo(e.target.value)}
                            className="h-9 min-w-0 bg-background"
                        />
                    </div>
                    {/* Station filter */}
                    <Select value={stationId} onValueChange={setStationId}>
                        <SelectTrigger id="payment-station" className="h-9 min-w-0 bg-background">
                            <SelectValue placeholder="All stations" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All stations</SelectItem>
                            {(filterOptions?.stations ?? []).map((station) => (
                                <SelectItem key={station.id} value={String(station.id)}>
                                    {station.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                        <a href={excelExportHref}>
                            <FileSpreadsheet className="h-4 w-4" aria-hidden />
                            Export Excel
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                        <Link href={route('payments-report.index')}>
                            <Receipt className="h-4 w-4" aria-hidden />
                            Payment log
                        </Link>
                    </Button>
                </div>

                <section className="space-y-4" aria-labelledby="bill-period-heading">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        <RevenueStatCard title="Bills generated" valueClassName="text-emerald-700">
                            {(safeSummary.total_bills_generated ?? 0).toLocaleString()}
                        </RevenueStatCard>
                        <RevenueStatCard title="Paid" valueClassName="text-emerald-600">
                            {(safeSummary.bills_paid_count ?? 0).toLocaleString()}
                        </RevenueStatCard>
                        <RevenueStatCard title="Pending (incl. partial)" valueClassName="text-amber-700">
                            {(safeSummary.bills_pending_count ?? 0).toLocaleString()}
                        </RevenueStatCard>
                        <RevenueStatCard title="Forwarded" valueClassName="text-slate-700">
                            {(safeSummary.bills_forwarded_count ?? 0).toLocaleString()}
                        </RevenueStatCard>
                        <RevenueStatCard title="Collection rate" valueClassName="text-primary">
                            {`${Number(safeSummary.collection_rate_percent ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%`}
                        </RevenueStatCard>
                    </div>
                </section>

                <RevenueCharts zoneRevenueComparison={zoneRevenueComparison} chartData={chartData} />

                <RevenueSummaryTable summary={safeSummary} filters={safeFilters} />

                <RevenueMonthlyBreakdownTable
                    monthlyBreakdown={monthlyBreakdown}
                    year={monthlyBreakdownYear}
                />
            </div>
        </AppLayout>
    );
}
