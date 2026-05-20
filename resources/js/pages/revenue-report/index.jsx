import { RevenueCollectionAlert } from '@/components/reports/revenue-collection-alert';
import { RevenueCollectionCharts } from '@/components/reports/revenue-collection-charts';
import { RevenueCollectionKpis } from '@/components/reports/revenue-collection-kpis';
import { RevenueManagementCommentary } from '@/components/reports/revenue-management-commentary';
import { RevenueMonthlyBreakdownTable } from '@/components/reports/revenue-monthly-breakdown-table';
import { RevenueStreamCards } from '@/components/reports/revenue-stream-cards';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, FileSpreadsheet, MapPin, Receipt } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const reportHref = () => route('revenue-report.index');

const breadcrumbs = [
    {
        title: 'Revenue report',
        href: reportHref(),
    },
];

const ALL_MONTHS_VALUE = 'all';

/**
 * @param {{ month?: string }} [f]
 */
function initialMonth(f) {
    const month = f?.month?.trim() ?? '';

    if (month === ALL_MONTHS_VALUE || /^\d{4}-\d{2}$/.test(month)) {
        return month;
    }

    return ALL_MONTHS_VALUE;
}

/**
 * @param {string} month YYYY-MM or "all"
 */
function formatMonthLabel(month) {
    if (month === ALL_MONTHS_VALUE) {
        return `All months (${new Date().getFullYear()})`;
    }

    const [year, monthIndex] = month.split('-').map(Number);
    if (!year || !monthIndex) {
        return month;
    }

    return new Date(year, monthIndex - 1, 1).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    });
}

/**
 * @returns {Array<{ value: string, label: string }>}
 */
function buildMonthSelectOptions() {
    const options = [{ value: ALL_MONTHS_VALUE, label: `All months (${new Date().getFullYear()})` }];
    const now = new Date();

    for (let offset = 0; offset < 24; offset += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        options.push({
            value,
            label: formatMonthLabel(value),
        });
    }

    return options;
}

function toStringId(value) {
    return value != null && value !== '' ? String(value) : 'all';
}

/**
 * @param {string} month
 */
function periodSubtitle(month) {
    if (month === ALL_MONTHS_VALUE) {
        return 'for the selected year';
    }

    return `for ${formatMonthLabel(month)}`;
}

export default function RevenueReport({
    summary,
    chartData = [],
    filters,
    financeFilters,
    filterOptions,
    monthlyBreakdown = [],
    monthlyBreakdownYear,
    collectionTargetPercent = 90,
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

    const safeFilters = filters ?? { search: '', month: ALL_MONTHS_VALUE };
    const targetPercent = Number(collectionTargetPercent ?? 90);

    const monthSelectOptions = useMemo(() => buildMonthSelectOptions(), []);
    const [month, setMonth] = useState(() => initialMonth(safeFilters));
    const [stationId, setStationId] = useState(toStringId(financeFilters?.station_id));

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                reportHref(),
                {
                    month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
                    search: filters?.search?.trim() || undefined,
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
                        'collectionTargetPercent',
                    ],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [month, stationId, filters?.search]);

    const excelExportHref = route('revenue-report.export', {
        month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
        search: safeFilters.search || undefined,
    });

    const periodLabel = month === ALL_MONTHS_VALUE ? 'year to date' : periodSubtitle(month);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue report" />

            <div className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:p-6">
                <header className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                    <div className="border-b border-border/60 bg-muted/20 px-4 py-4 md:px-6">
                        <div className="flex  gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl lg:text-2xl">
                                    Water Utility Revenue and Collection Analysis
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Collection performance {periodLabel}
                                    {monthlyBreakdownYear ? (
                                        <span className="text-foreground/70"> · {monthlyBreakdownYear}</span>
                                    ) : null}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                                <Button variant="outline" size="sm" className="h-9 gap-2 bg-background" asChild>
                                    <a href={excelExportHref}>
                                        <FileSpreadsheet className="h-4 w-4" aria-hidden />
                                        Export Excel
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 gap-2 bg-background" asChild>
                                    <Link href={route('payments-report.index')}>
                                        <Receipt className="h-4 w-4" aria-hidden />
                                        Payment log
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end md:px-6">
                        <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5 sm:max-w-xs">
                            <label
                                htmlFor="revenue-month"
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                            >
                                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                                Period
                            </label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger id="revenue-month" className="h-9 w-full bg-background">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthSelectOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex min-w-[9rem] flex-1 flex-col gap-1.5 sm:max-w-xs">
                            <label
                                htmlFor="payment-station"
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                            >
                                <MapPin className="h-3.5 w-3.5" aria-hidden />
                                Station
                            </label>
                            <Select value={stationId} onValueChange={setStationId}>
                                <SelectTrigger id="payment-station" className="h-9 w-full bg-background">
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
                        </div>
                    </div>
                </header>

                <RevenueCollectionAlert
                    summary={safeSummary}
                    monthlyBreakdown={monthlyBreakdown}
                    collectionTargetPercent={targetPercent}
                    periodLabel={periodLabel}
                />

                <RevenueCollectionKpis summary={safeSummary} />

                <RevenueStreamCards summary={safeSummary} />

                <RevenueCollectionCharts
                    chartData={chartData}
                    summary={safeSummary}
                    collectionTargetPercent={targetPercent}
                />

                <RevenueMonthlyBreakdownTable
                    monthlyBreakdown={monthlyBreakdown}
                    year={monthlyBreakdownYear}
                />
                <div className="xl:col-span-3">
                    <RevenueManagementCommentary
                        summary={safeSummary}
                        monthlyBreakdown={monthlyBreakdown}
                        collectionTargetPercent={targetPercent}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
