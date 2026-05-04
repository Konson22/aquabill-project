import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Download,
    Droplets,
    Map,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const reportHref = () => route('reports.water-usage');

const breadcrumbs = [
    {
        title: 'Water Usage Report',
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
function initialUsageRange(f) {
    const from = f.from?.trim() ?? '';
    const to = f.to?.trim() ?? '';
    if (from && to) {
        return { from, to };
    }

    return calendarFullYearBounds();
}

/**
 * @param {object} props
 * @param {{ total_consumption?: number, avg_consumption?: number, bills_count?: number }} [props.summary]
 * @param {Array<{ date: string, consumption: number }>} [props.chartData]
 * @param {{ granularity?: 'day' | 'month' }} [props.chartMeta]
 * @param {Array<{ name: string, consumption: number }>} [props.zoneData]
 * @param {Array<{ id: number, name: string, account: string, consumption: number }>} [props.topConsumers]
 * @param {{ from?: string, to?: string }} [props.filters]
 */
export default function WaterUsageReport({
    summary,
    chartData = [],
    chartMeta,
    zoneData = [],
    topConsumers = [],
    filters,
}) {
    const safeSummary = summary ?? {
        total_consumption: 0,
        avg_consumption: 0,
        bills_count: 0,
    };

    const safeChartMeta = chartMeta ?? { granularity: 'day' };
    const safeFilters = filters ?? { from: '', to: '' };

    const [from, setFrom] = useState(() => initialUsageRange(safeFilters).from);
    const [to, setTo] = useState(() => initialUsageRange(safeFilters).to);

    const zonesForChart = useMemo(
        () => zoneData.filter((z) => Number(z.consumption) > 0),
        [zoneData],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                reportHref(),
                {
                    from,
                    to,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['summary', 'chartData', 'chartMeta', 'zoneData', 'topConsumers', 'filters'],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [from, to]);

    const exportCsv = () => {
        const q = (v) => `"${String(v).replaceAll('"', '""')}"`;

        const lines = [
            `${q('Water usage report')},${q(`${from} to ${to}`)}`,
            '',
            `${q('Metric')},${q('Value')}`,
            `${q('Total consumption (m³)')},${q(safeSummary.total_consumption)}`,
            `${q('Average per bill (m³)')},${q(safeSummary.avg_consumption)}`,
            `${q('Bills in period')},${q(safeSummary.bills_count)}`,
            '',
            `${q('Period')},${q('Consumption (m³)')}`,
            ...chartData.map((row) => `${q(row.date)},${q(row.consumption)}`),
            '',
            `${q('Zone')},${q('Consumption (m³)')}`,
            ...zoneData.map((z) => `${q(z.name)},${q(z.consumption)}`),
            '',
            `${q('Customer')},${q('Account')},${q('Consumption (m³)')}`,
            ...topConsumers.map((c) => `${q(c.name)},${q(c.account)},${q(c.consumption)}`),
        ];

        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `water-usage-${from}-to-${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const trendTitle =
        safeChartMeta.granularity === 'month' ? 'Consumption by month' : 'Daily consumption trend';
    const trendSubtitle =
        safeChartMeta.granularity === 'month'
            ? 'Total billed cubic meters per calendar month in the selected range'
            : 'Total billed cubic meters per bill issue date';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water Usage Report" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Droplets className="h-7 w-7 text-sky-600" />
                            Water usage
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                            Consumption comes from bill records (metered usage billed in each cycle). Use the period
                            filter to match your reporting window; long ranges switch the chart to monthly totals.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2" type="button" onClick={exportCsv}>
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={route('readings.index')}>Meter readings</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="border-sky-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Total consumption
                                    </CardTitle>
                                    <Droplets className="h-4 w-4 shrink-0 text-sky-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tabular-nums text-sky-700">
                                    {Number(safeSummary.total_consumption).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                    })}{' '}
                                    <span className="text-sm font-medium text-muted-foreground">m³</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Sum of billed usage in period</p>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Avg. per bill
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tabular-nums text-emerald-700">
                                    {Number(safeSummary.avg_consumption).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                    })}{' '}
                                    <span className="text-sm font-medium text-muted-foreground">m³</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Mean consumption per bill</p>
                            </CardContent>
                        </Card>

                        <Card className="border-amber-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Bills counted
                                    </CardTitle>
                                    <Activity className="h-4 w-4 shrink-0 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold tabular-nums text-amber-800">
                                    {Number(safeSummary.bills_count).toLocaleString()}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Bills issued in date range</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground" htmlFor="wu-from">
                                    From
                                </label>
                                <Input
                                    id="wu-from"
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground" htmlFor="wu-to">
                                    To
                                </label>
                                <Input
                                    id="wu-to"
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    const b = calendarFullYearBounds();
                                    setFrom(b.from);
                                    setTo(b.to);
                                }}
                            >
                                Reset to this year
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">{trendTitle}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">{trendSubtitle}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wide">
                                    {safeChartMeta.granularity === 'month' ? 'Monthly' : 'Daily'} · m³
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-72 w-full min-h-[18rem]">
                                {chartData.length === 0 ? (
                                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
                                        No bills in this period.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                interval={safeChartMeta.granularity === 'month' ? 0 : 'preserveStartEnd'}
                                                height={safeChartMeta.granularity === 'month' ? 52 : 36}
                                                angle={safeChartMeta.granularity === 'month' ? -30 : 0}
                                                textAnchor={safeChartMeta.granularity === 'month' ? 'end' : 'middle'}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                tickFormatter={(val) => `${val}`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value) => [
                                                    `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} m³`,
                                                    'Consumption',
                                                ]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="consumption"
                                                stroke="#0284c7"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#usageGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-base">By zone</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Billed usage by customer zone</p>
                                </div>
                                <Map className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-72 w-full min-h-[18rem]">
                                {zonesForChart.length === 0 ? (
                                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                                        No zone usage in this period.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={zonesForChart}
                                            layout="vertical"
                                            margin={{ left: 4, right: 8 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: '#334155' }}
                                                width={88}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(14, 165, 233, 0.06)' }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value) => [
                                                    `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} m³`,
                                                    'Usage',
                                                ]}
                                            />
                                            <Bar dataKey="consumption" radius={[0, 6, 6, 0]} barSize={20}>
                                                {zonesForChart.map((entry, index) => (
                                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 py-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-sky-600" />
                                <CardTitle className="text-base">Top consumers</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground">Highest total billed consumption in period</p>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Customer</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right pr-6">Consumption (m³)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topConsumers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="pl-6 font-medium">
                                        <Link
                                            href={route('customers.show', customer.id)}
                                            className="text-sky-700 hover:underline"
                                        >
                                            {customer.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {customer.account}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 tabular-nums font-semibold text-sky-800">
                                        {Number(customer.consumption).toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {topConsumers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-12 text-center text-muted-foreground text-sm">
                                        No usage in this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
