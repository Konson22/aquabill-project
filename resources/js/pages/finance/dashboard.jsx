import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn, formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, FileSpreadsheet } from 'lucide-react';
import { useMemo } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs = [{ title: 'Finance Dashboard' }];

const LOOKER = {
    blue: '#4285F4',
    green: '#34A853',
    yellow: '#FBBC04',
    red: '#EA4335',
    orange: '#FF6D01',
    slate: '#5f6368',
    grid: '#e8eaed',
};

const ZONE_COLORS = [LOOKER.blue, LOOKER.green, LOOKER.yellow, LOOKER.orange, '#8b5cf6', '#14b8a6', '#ec4899', LOOKER.slate];

const STATUS_META = {
    pending: { label: 'Pending', color: LOOKER.yellow },
    partial: { label: 'Partial', color: LOOKER.blue },
    paid: { label: 'Paid', color: LOOKER.green },
    overdue: { label: 'Overdue', color: LOOKER.red },
};

const tooltipStyle = {
    borderRadius: '8px',
    border: `1px solid ${LOOKER.grid}`,
    boxShadow: '0 1px 3px rgb(0 0 0 / 0.12)',
    fontSize: '12px',
    fontWeight: 500,
};

/**
 * @param {{ label: string, value: import('react').ReactNode, accent?: string, sub?: string }} props
 */
function Scorecard({ label, value, accent = LOOKER.blue, sub }) {
    return (
        <div className="relative overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm">
            <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} aria-hidden />
            <div className="px-4 py-3.5 pl-5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">
                    {value}
                </p>
                {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
            </div>
        </div>
    );
}

function ChartPanel({ title, description, children, className }) {
    return (
        <Card className={cn('overflow-hidden border-border/60 bg-card shadow-sm', className)}>
            <CardHeader className="space-y-1 border-b border-border/40 bg-muted/20 px-4 py-3 sm:px-5">
                <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
                {description ? <CardDescription className="text-xs leading-snug">{description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="p-4 sm:p-5">{children}</CardContent>
        </Card>
    );
}

export default function FinanceDashboard({
    summary = {},
    billStatusCounts = {},
    billStatusAmounts = {},
    monthlyCollectionSummary = [],
    zoneRevenueComparison = [],
}) {
    const updatedLabel = useMemo(
        () =>
            new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
        [],
    );

    const statusRows = useMemo(() => {
        const keys = ['pending', 'partial', 'paid', 'overdue'];
        const totalCount = keys.reduce((sum, key) => sum + (billStatusCounts[key] ?? 0), 0);
        const totalAmount =
            (billStatusAmounts.pending ?? 0) +
            (billStatusAmounts.partial ?? 0) +
            (billStatusAmounts.paid ?? 0) +
            (summary.outstanding_bills ?? 0);

        return keys.map((key) => {
            const count = billStatusCounts[key] ?? 0;
            const amount =
                key === 'overdue'
                    ? Number(summary.outstanding_bills ?? 0)
                    : Number(billStatusAmounts[key] ?? 0);

            return {
                key,
                label: STATUS_META[key].label,
                color: STATUS_META[key].color,
                count,
                amount,
                countPct: totalCount > 0 ? (count / totalCount) * 100 : 0,
                amountPct: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
            };
        });
    }, [billStatusCounts, billStatusAmounts, summary.outstanding_bills]);

    const statusPieData = useMemo(
        () =>
            statusRows
                .filter((row) => row.amount > 0)
                .map((row) => ({
                    name: row.label,
                    value: row.amount,
                    fill: row.color,
                })),
        [statusRows],
    );

    const statusPieTotal = useMemo(() => statusPieData.reduce((sum, d) => sum + d.value, 0), [statusPieData]);

    const zoneBarData = useMemo(
        () =>
            [...zoneRevenueComparison]
                .map((row) => ({
                    zone: row.zone,
                    collected: Number(row.collected) || 0,
                }))
                .sort((a, b) => b.collected - a.collected),
        [zoneRevenueComparison],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance Dashboard" />

            <div className="min-h-full bg-[#f1f3f4] dark:bg-background">
                <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-4 sm:p-6">
                    <header className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5f6368] dark:text-muted-foreground">
                                Billing dashboard
                            </p>
                            <h1 className="mt-0.5 text-xl font-normal tracking-tight text-[#202124] dark:text-foreground sm:text-2xl">
                                Finance overview
                            </h1>
                            <p className="mt-1 text-xs text-muted-foreground">Collections and receivables · {updatedLabel}</p>
                        </div>
                        <Button variant="outline" size="sm" className="shrink-0 border-border/80 bg-background" asChild>
                            <Link href={route('revenue-report.index')} className="gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Revenue reports
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                            </Link>
                        </Button>
                    </header>

                    <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <Scorecard
                            label="Total revenue collected"
                            value={formatCurrencyCompact(summary.total_revenue_collected ?? 0)}
                            accent={LOOKER.green}
                            sub="All-time bill & service payments"
                        />
                        <Scorecard
                            label="Outstanding receivables"
                            value={formatCurrencyCompact(summary.outstanding_bills ?? 0)}
                            accent={LOOKER.red}
                            sub="Pending & partial balances"
                        />
                        <Scorecard
                            label="Collected this month"
                            value={formatCurrencyCompact(summary.this_month_collected ?? 0)}
                            accent={LOOKER.blue}
                            sub={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        />
                        <Scorecard
                            label="Collection rate"
                            value={`${summary.collection_rate ?? 0}%`}
                            accent={LOOKER.orange}
                            sub="Paid vs total billed"
                        />
                        <Scorecard
                            label="Overdue bills"
                            value={(summary.overdue_bills ?? 0).toLocaleString()}
                            accent={LOOKER.yellow}
                            sub="Past due date · unpaid"
                        />
                    </section>

                    <section
                        aria-label="Trends and breakdown"
                        className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:items-stretch"
                    >
                        <ChartPanel
                            title="Monthly collections"
                            description="Bill payments and paid service charges over the last six months."
                            className="xl:col-span-8"
                        >
                            {monthlyCollectionSummary.length > 0 ? (
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyCollectionSummary} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="financeCollectionFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={LOOKER.blue} stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor={LOOKER.blue} stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke={LOOKER.grid} strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: LOOKER.slate }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: LOOKER.slate }}
                                                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                                                width={44}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                formatter={(value) => [formatCurrency(Number(value)), 'Collected']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="collected"
                                                stroke={LOOKER.blue}
                                                strokeWidth={2}
                                                fill="url(#financeCollectionFill)"
                                                name="Collected"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="py-16 text-center text-sm text-muted-foreground">No collection data for this period.</p>
                            )}
                        </ChartPanel>

                        <ChartPanel
                            title="Receivables by status"
                            description="Share of bill amounts by payment status (overdue uses outstanding balance)."
                            className="xl:col-span-4"
                        >
                            {statusPieData.length > 0 && statusPieTotal > 0 ? (
                                <div className="flex flex-col items-center">
                                    <div className="relative h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={52}
                                                    outerRadius={88}
                                                    paddingAngle={2}
                                                >
                                                    {statusPieData.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={tooltipStyle}
                                                    formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Total
                                            </span>
                                            <span className="text-sm font-semibold tabular-nums">{formatCurrency(statusPieTotal)}</span>
                                        </div>
                                    </div>
                                    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                                        {statusPieData.map((entry) => (
                                            <li key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span
                                                    className="h-2 w-2 shrink-0 rounded-full"
                                                    style={{ backgroundColor: entry.fill }}
                                                    aria-hidden
                                                />
                                                {entry.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="py-16 text-center text-sm text-muted-foreground">No bill status amounts to chart.</p>
                            )}
                        </ChartPanel>
                    </section>

                    <section aria-label="Zone and aging detail" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <ChartPanel title="Revenue by zone" description="Total collections attributed to each supply zone.">
                            {zoneBarData.length > 0 ? (
                                <div className="h-[min(320px,40vh)] min-h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={zoneBarData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                                            <CartesianGrid stroke={LOOKER.grid} strokeDasharray="3 3" horizontal={false} />
                                            <XAxis
                                                type="number"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: LOOKER.slate }}
                                                tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="zone"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 11, fill: LOOKER.slate }}
                                                width={100}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                formatter={(value) => [formatCurrency(Number(value)), 'Collected']}
                                            />
                                            <Bar dataKey="collected" radius={[0, 4, 4, 0]} name="Collected">
                                                {zoneBarData.map((entry, index) => (
                                                    <Cell key={entry.zone} fill={ZONE_COLORS[index % ZONE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="py-12 text-center text-sm text-muted-foreground">No zone revenue data.</p>
                            )}
                        </ChartPanel>

                        <ChartPanel
                            title="Bill status summary"
                            description="Aging-style view of open and closed receivables (counts and amounts)."
                        >
                            <div className="overflow-x-auto rounded-md border border-border/50">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Bills</TableHead>
                                            <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Amount</TableHead>
                                            <TableHead className="hidden text-right text-xs font-semibold uppercase tracking-wide sm:table-cell">
                                                % of total
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {statusRows.map((row) => (
                                            <TableRow key={row.key}>
                                                <TableCell>
                                                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                                                        <span
                                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                            style={{ backgroundColor: row.color }}
                                                            aria-hidden
                                                        />
                                                        {row.label}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-sm">
                                                    {row.count.toLocaleString()}
                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                        ({row.countPct.toFixed(0)}%)
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium tabular-nums">
                                                    {formatCurrency(row.amount)}
                                                </TableCell>
                                                <TableCell className="hidden text-right sm:table-cell">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${Math.min(100, row.amountPct)}%`,
                                                                    backgroundColor: row.color,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-9 text-xs tabular-nums text-muted-foreground">
                                                            {row.amountPct.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </ChartPanel>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
