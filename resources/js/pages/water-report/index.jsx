import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Droplets, FileSpreadsheet, Minus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const ZONE_COLORS = ['#1a73e8', '#34a853', '#f9ab00', '#ea4335', '#9334e6', '#e8710a'];

const reportHref = () => route('water-report.index');

const breadcrumbs = [
    {
        title: 'Water report',
        href: reportHref(),
    },
];

const ALL_MONTHS_VALUE = 'all';

/**
 * @param {{ month?: string }} [f]
 */
function initialMonth(f) {
    const month = f?.month?.trim() ?? '';
    if (month === '' || month === ALL_MONTHS_VALUE) {
        return ALL_MONTHS_VALUE;
    }

    return month;
}

/**
 * @param {string} month YYYY-MM or "all"
 */
function formatMonthLabel(month) {
    if (month === ALL_MONTHS_VALUE) {
        return 'All months';
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
    const options = [{ value: ALL_MONTHS_VALUE, label: 'All months' }];
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
 * @param {string} zoneId
 * @param {string} tariffId
 * @param {{ id: number, name: string }[]} zones
 * @param {{ id: number, name: string }[]} tariffs
 */
function formatFilterSummary(month, zoneId, tariffId, zones, tariffs) {
    const parts = [
        month === ALL_MONTHS_VALUE
            ? `All months (${new Date().getFullYear()})`
            : formatMonthLabel(month),
    ];

    if (zoneId !== 'all') {
        const zone = zones.find((z) => String(z.id) === zoneId);
        parts.push(zone?.name ?? 'Zone');
    }

    if (tariffId !== 'all') {
        const tariff = tariffs.find((t) => String(t.id) === tariffId);
        parts.push(tariff?.name ?? 'Tariff');
    }

    return parts.join(' · ');
}

/**
 * @param {number} value
 * @param {number} [maximumFractionDigits]
 */
function formatVolume(value, maximumFractionDigits = 2) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits });
}

/**
 * @param {number} current
 * @param {number} previous
 * @returns {number | null} Percent change, or null when prior period had no baseline.
 */
function monthOverMonthPercentChange(current, previous) {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return ((current - previous) / previous) * 100;
}

/**
 * @param {number | null} percent
 */
function formatMonthComparison(percent) {
    if (percent === null) {
        return '';
    }

    const rounded = Number(percent.toFixed(1));
    const sign = rounded > 0 ? '+' : '';

    return `${sign}${rounded}%`;
}

/**
 * @param {{ label: string, percent: number | null, className?: string }} props
 */
function ComparisonBadge({ label, percent, className }) {
    if (percent === null) {
        return null;
    }

    const rounded = Number(percent.toFixed(1));
    const isUp = rounded > 0;
    const isDown = rounded < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    const formatted = formatMonthComparison(rounded);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none tabular-nums',
                isUp &&
                    'border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
                isDown &&
                    'border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
                !isUp && !isDown && 'border-border bg-muted/40 text-muted-foreground',
                className,
            )}
            title={`${label}: ${formatted} vs previous month`}
        >
            <span className="sr-only">{label} </span>
            <Icon className="h-3 w-3 shrink-0" aria-hidden />
            {formatted}
        </span>
    );
}

/**
 * @param {{
 *   volumeChangePct: number | null,
 *   billsChangePct: number | null,
 *   previousMonthLabel?: string | null,
 * }} props
 */
function MonthComparisonCell({ volumeChangePct, billsChangePct, previousMonthLabel }) {
    const hasComparison = volumeChangePct !== null || billsChangePct !== null;

    if (!hasComparison) {
        return (
            <div className="flex justify-end">
                <span className="text-sm text-muted-foreground" title="First month in selected range">
                    —
                </span>
            </div>
        );
    }

    const groupLabel = previousMonthLabel
        ? `Change compared with ${previousMonthLabel}`
        : 'Change compared with previous month';

    return (
        <div
            className="flex flex-wrap items-center justify-end gap-1"
            role="group"
            aria-label={groupLabel}
            title={groupLabel}
        >
            <ComparisonBadge label="Volume" percent={volumeChangePct} />
            <ComparisonBadge
                label="Bills"
                percent={billsChangePct}
                className="ring-1 ring-border/50 ring-inset"
            />
        </div>
    );
}

/**
 * @param {Array<{ month: string, label: string, consumption: number, bills_count: number }>} rows
 */
function monthlyRowsWithComparison(rows) {
    return rows.map((row, index) => {
        const previous = index > 0 ? rows[index - 1] : null;

        return {
            ...row,
            previousMonthLabel: previous?.label ?? null,
            volumeChangePct: previous
                ? monthOverMonthPercentChange(row.consumption, previous.consumption)
                : null,
            billsChangePct: previous
                ? monthOverMonthPercentChange(row.bills_count, previous.bills_count)
                : null,
        };
    });
}

/**
 * @param {{ label: string, value: string, hint?: string, className?: string }} props
 */
function ReportMetric({ label, value, hint, className }) {
    return (
        <div className={cn('min-w-0 px-5 py-4 sm:px-6 sm:py-5', className)}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-[1.65rem]">
                {value}
            </p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

/**
 * @param {{ label: string, children: import('react').ReactNode, htmlFor?: string, className?: string }} props
 */
function FilterField({ label, children, htmlFor, className }) {
    return (
        <div className={cn('space-y-2', className)}>
            <label className="text-xs font-medium text-muted-foreground" htmlFor={htmlFor}>
                {label}
            </label>
            {children}
        </div>
    );
}

const filterSelectClassName = 'h-9 w-full bg-background';

/**
 * @param {{ color: string, label: string }} props
 */
function ChartLegendItem({ color, label }) {
    return (
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            {label}
        </span>
    );
}

/**
 * @param {object} props
 * @param {{ total_consumption?: number, avg_consumption?: number, bills_count?: number }} [props.summary]
 * @param {Array<{ date: string, consumption: number }>} [props.chartData]
 * @param {{ granularity?: 'day' | 'month' }} [props.chartMeta]
 * @param {Array<{ name: string, consumption: number }>} [props.zoneData]
 * @param {Array<{ month: string, label: string, consumption: number, bills_count: number }>} [props.monthlyBreakdown]
 * @param {Array<{ id: number, name: string, account: string, consumption: number }>} [props.topConsumers]
 * @param {{ month?: string, zone_id?: number | null, tariff_id?: number | null }} [props.filters]
 * @param {{ zones?: { id: number, name: string }[], tariffs?: { id: number, name: string }[] }} [props.filterOptions]
 */
export default function WaterUsageReport({
    summary,
    chartData = [],
    chartMeta,
    zoneData = [],
    monthlyBreakdown = [],
    topConsumers = [],
    filters,
    filterOptions,
}) {
    const safeSummary = summary ?? {
        total_consumption: 0,
        avg_consumption: 0,
        bills_count: 0,
    };

    const safeChartMeta = chartMeta ?? { granularity: 'month' };
    const safeFilters = filters ?? {};
    const zones = filterOptions?.zones ?? [];
    const tariffs = filterOptions?.tariffs ?? [];
    const monthSelectOptions = useMemo(() => buildMonthSelectOptions(), []);

    const [month, setMonth] = useState(() => initialMonth(safeFilters));
    const [zoneId, setZoneId] = useState(toStringId(safeFilters.zone_id));
    const [tariffId, setTariffId] = useState(toStringId(safeFilters.tariff_id));

    const zonesForChart = useMemo(
        () => zoneData.filter((z) => Number(z.consumption) > 0),
        [zoneData],
    );

    const monthlyRows = useMemo(
        () => monthlyRowsWithComparison(monthlyBreakdown),
        [monthlyBreakdown],
    );

    const filterSummary = formatFilterSummary(month, zoneId, tariffId, zones, tariffs);
    const isMonthly = safeChartMeta.granularity === 'month';
    const trendChartTitle = isMonthly
        ? 'Consumption by month for selected period'
        : `Daily consumption for ${formatMonthLabel(month)}`;

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                reportHref(),
                {
                    month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    tariff_id: tariffId === 'all' ? undefined : tariffId,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: [
                        'summary',
                        'chartData',
                        'chartMeta',
                        'zoneData',
                        'monthlyBreakdown',
                        'topConsumers',
                        'filters',
                        'filterOptions',
                    ],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [month, zoneId, tariffId]);

    const excelExportHref = useMemo(
        () =>
            route('water-report.export', {
                month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
                zone_id: zoneId === 'all' ? undefined : zoneId,
                tariff_id: tariffId === 'all' ? undefined : tariffId,
            }),
        [month, zoneId, tariffId],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water report" />

            <div className="min-h-full bg-muted/35 p-4 md:p-6">
                <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                                <Droplets className="h-7 w-7 text-primary" aria-hidden />
                                Water usage
                            </h1>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Billed metered consumption by reading date for {filterSummary}.
                            </p>
                        </div>
                       
                    </div>

                    <Card className="border bg-card shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Filters</CardTitle>
                            <CardDescription>
                                Month, zone, and tariff apply to all charts and tables below. Data is based on meter
                                reading date.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <FilterField label="Month">
                                    <Select value={month} onValueChange={setMonth}>
                                        <SelectTrigger className={filterSelectClassName}>
                                            <SelectValue placeholder="All months" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {monthSelectOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                                <FilterField label="Zone">
                                    <Select value={zoneId} onValueChange={setZoneId}>
                                        <SelectTrigger className={filterSelectClassName}>
                                            <SelectValue placeholder="All zones" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All zones</SelectItem>
                                            {zones.map((zone) => (
                                                <SelectItem key={zone.id} value={String(zone.id)}>
                                                    {zone.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                                <FilterField label="Tariff">
                                    <Select value={tariffId} onValueChange={setTariffId}>
                                        <SelectTrigger className={filterSelectClassName}>
                                            <SelectValue placeholder="All tariffs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All tariffs</SelectItem>
                                            {tariffs.map((tariff) => (
                                                <SelectItem key={tariff.id} value={String(tariff.id)}>
                                                    {tariff.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FilterField>
                                <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
                                    <Button variant="outline" size="sm" className="h-9 w-full gap-2 sm:w-auto" asChild>
                                        <a href={excelExportHref}>
                                            <FileSpreadsheet className="h-4 w-4" aria-hidden />
                                            Export Excel
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border bg-card shadow-sm">
                        <CardContent className="grid divide-y p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            <ReportMetric
                                label="Total consumption"
                                value={`${formatVolume(safeSummary.total_consumption)} m³`}
                                hint="Sum of billed usage in period"
                            />
                            <ReportMetric
                                label="Average per bill"
                                value={`${formatVolume(safeSummary.avg_consumption)} m³`}
                                hint="Mean consumption per bill"
                            />
                            <ReportMetric
                                label="Bills in period"
                                value={formatVolume(safeSummary.bills_count, 0)}
                                hint="Bill records in date range"
                            />
                        </CardContent>
                    </Card>

                    <div className="flex gap-5 xl:grid-cols-2">
                        <Card className="flex-1 border bg-card shadow-sm">
                            <CardContent className="p-0">
                                <div className="border-b px-5 py-4">
                                    <h2 className="text-sm font-semibold text-foreground">{trendChartTitle}</h2>
                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                        <ChartLegendItem color="#34a853" label="Consumption (m³)" />
                                    </div>
                                </div>
                                <div className="h-[19rem] w-full px-2 pb-4 pt-2 sm:h-[21rem]">
                                    {chartData.length === 0 ? (
                                        <div className="flex h-full items-center justify-center rounded-md border border-dashed bg-muted/20 text-sm text-muted-foreground">
                                            No bills in this period.
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={chartData}
                                                margin={{ top: 12, right: 16, left: 4, bottom: 8 }}
                                            >
                                                <CartesianGrid stroke="#e8eaed" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 11, fill: '#5f6368' }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#dadce0' }}
                                                    interval={isMonthly ? 0 : 'preserveStartEnd'}
                                                    angle={isMonthly ? -35 : 0}
                                                    textAnchor={isMonthly ? 'end' : 'middle'}
                                                    height={isMonthly ? 56 : 32}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 11, fill: '#5f6368' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    width={48}
                                                    tickFormatter={(val) => formatVolume(val, 0)}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #dadce0',
                                                        boxShadow: '0 1px 4px rgb(60 64 67 / 0.15)',
                                                        fontSize: '12px',
                                                    }}
                                                    formatter={(value) => [
                                                        `${formatVolume(value)} m³`,
                                                        'Consumption',
                                                    ]}
                                                />
                                                <Legend content={() => null} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="consumption"
                                                    name="Consumption (m³)"
                                                    stroke="#34a853"
                                                    strokeWidth={2.5}
                                                    dot={{ r: 4, fill: '#34a853', strokeWidth: 0 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="w-[35%] border bg-card shadow-sm">
                            <CardContent className="p-0">
                                <div className="border-b px-5 py-4">
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Consumption by zone for {formatMonthLabel(month)}
                                    </h2>
                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                        <ChartLegendItem color="#1a73e8" label="Zone usage (m³)" />
                                    </div>
                                </div>
                                <div className="h-[19rem] w-full px-2 pb-4 pt-2 sm:h-[21rem]">
                                    {zonesForChart.length === 0 ? (
                                        <div className="flex h-full items-center justify-center rounded-md border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                                            No zone usage in this period.
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={zonesForChart}
                                                layout="vertical"
                                                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                                            >
                                                <CartesianGrid stroke="#e8eaed" horizontal={false} />
                                                <XAxis
                                                    type="number"
                                                    tick={{ fontSize: 11, fill: '#5f6368' }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#dadce0' }}
                                                    tickFormatter={(val) => formatVolume(val, 0)}
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    width={92}
                                                    tick={{ fontSize: 11, fill: '#3c4043' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(26, 115, 232, 0.06)' }}
                                                    contentStyle={{
                                                        borderRadius: '8px',
                                                        border: '1px solid #dadce0',
                                                        fontSize: '12px',
                                                    }}
                                                    formatter={(value) => [
                                                        `${formatVolume(value)} m³`,
                                                        'Usage',
                                                    ]}
                                                />
                                                <Bar dataKey="consumption" radius={[0, 4, 4, 0]} barSize={22}>
                                                    {zonesForChart.map((entry, index) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={ZONE_COLORS[index % ZONE_COLORS.length]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border bg-card shadow-sm">
                        <div className="border-b bg-card px-5 py-4">
                            <h2 className="text-sm font-semibold text-foreground">Consumption by month</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Billed volume and bill count grouped by meter{' '}
                                <span className="text-foreground/80">reading date</span> for {filterSummary}.{' '}
                                <span className="text-foreground/80">vs last month</span> compares each row to
                                the previous month in the table.
                            </p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="pl-5 font-semibold text-foreground">Month</TableHead>
                                    <TableHead className="text-right font-semibold text-foreground">
                                        Volume (m³)
                                    </TableHead>
                                    <TableHead className="text-right font-semibold text-foreground">
                                        Bills generated
                                    </TableHead>
                                    <TableHead className="pr-5 text-right font-semibold text-foreground">
                                        <span className="block">vs last month</span>
                                        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                                            volume · bills
                                        </span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyRows.map((row) => (
                                    <TableRow key={row.month}>
                                        <TableCell className="pl-5 font-medium">{row.label}</TableCell>
                                        <TableCell className="text-right font-mono text-sm tabular-nums">
                                            {formatVolume(row.consumption)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm tabular-nums">
                                            {formatVolume(row.bills_count, 0)}
                                        </TableCell>
                                        <TableCell className="pr-5">
                                            <MonthComparisonCell
                                                volumeChangePct={row.volumeChangePct}
                                                billsChangePct={row.billsChangePct}
                                                previousMonthLabel={row.previousMonthLabel}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {monthlyRows.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-12 text-center text-sm text-muted-foreground"
                                        >
                                            No months in this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                            {monthlyRows.length > 0 && (
                                <tfoot>
                                    <TableRow className="border-t bg-muted/20 font-semibold hover:bg-muted/20">
                                        <TableCell className="pl-5">Total</TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">
                                            {formatVolume(safeSummary.total_consumption)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono tabular-nums">
                                            {formatVolume(safeSummary.bills_count, 0)}
                                        </TableCell>
                                        <TableCell className="pr-5" />
                                    </TableRow>
                                </tfoot>
                            )}
                        </Table>
                    </Card>

                    <Card className="overflow-hidden border bg-card shadow-sm">
                        <div className="border-b bg-card px-5 py-4">
                            <h2 className="text-sm font-semibold text-foreground">Top consumers</h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Highest total billed consumption in {filterSummary}
                            </p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="pl-5 font-semibold text-foreground">Customer</TableHead>
                                    <TableHead className="font-semibold text-foreground">Account</TableHead>
                                    <TableHead className="pr-5 text-right font-semibold text-foreground">
                                        Consumption (m³)
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topConsumers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="pl-5 font-medium">
                                            <Link
                                                href={route('customers.show', customer.id)}
                                                className="text-primary hover:underline"
                                            >
                                                {customer.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {customer.account}
                                        </TableCell>
                                        <TableCell className="pr-5 text-right font-mono text-sm font-semibold tabular-nums">
                                            {formatVolume(customer.consumption)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {topConsumers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                                            No usage in this period.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
