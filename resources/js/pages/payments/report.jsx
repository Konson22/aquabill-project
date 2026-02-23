import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { CreditCard, Download, Receipt, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    XAxis,
    YAxis,
} from 'recharts';

export default function PaymentReport({
    revenueByType,
    tariffRevenue,
    zoneRevenue,
    monthlyTrend,
    billKpis,
    invoiceKpis,
    totalRevenue,
}) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Payments', href: route('payments') },
        { title: 'Reports', href: route('payments.report') },
    ];

    const trendConfig = {
        paid: {
            label: 'Collected',
            color: 'hsl(var(--chart-2))',
        },
        unpaid: {
            label: 'Outstanding',
            color: 'hsl(var(--chart-5))',
        },
    };

    const tariffConfig = (tariffRevenue || []).reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {});

    const chartData = (() => {
        const today = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const monthStr = `${year}-${month}`;
            const found = (monthlyTrend || []).find(
                (m) => m.month === monthStr,
            );
            months.push(
                found
                    ? {
                          month: monthStr,
                          paid: Number(found.paid),
                          unpaid: Number(found.unpaid),
                      }
                    : { month: monthStr, paid: 0, unpaid: 0 },
            );
        }
        return months;
    })();

    const totalCollected =
        (Number(billKpis?.totalCollected) || 0) +
        (Number(invoiceKpis?.totalCollected) || 0);
    const totalBilled =
        (Number(billKpis?.totalBilled) || 0) +
        (Number(invoiceKpis?.totalBilled) || 0);
    const totalOutstanding =
        (Number(billKpis?.totalUnpaid) || 0) +
        (Number(invoiceKpis?.totalUnpaid) || 0);
    const collectionRate =
        totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    const tariffs = Array.isArray(tariffRevenue) ? tariffRevenue : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Reports" />
            <div className="space-y-8 pb-8">
                {/* Hero + Export */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Payment Report
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Billing, collection, and revenue by bills, invoices,
                            and tariff.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-fit gap-2 border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                        onClick={() =>
                            (window.location.href = route('payments.export'))
                        }
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>

                {/* Summary strip */}
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
                    <CardContent className="flex flex-wrap items-center gap-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Total collected
                                </p>
                                <p className="text-2xl font-bold text-foreground tabular-nums">
                                    {formatCurrency(totalCollected)}
                                </p>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Total billed
                            </p>
                            <p className="text-xl font-semibold text-muted-foreground tabular-nums">
                                {formatCurrency(totalBilled)}
                            </p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Outstanding
                            </p>
                            <p className="text-xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                                {formatCurrency(totalOutstanding)}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className={
                                    collectionRate >= 90
                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                        : collectionRate >= 70
                                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                          : ''
                                }
                            >
                                {collectionRate.toFixed(1)}% collection rate
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">
                                        Water bills
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Consumption revenue
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/40 p-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Billed
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-foreground">
                                        {formatCurrency(billKpis?.totalBilled)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {billKpis?.totalCount?.toLocaleString()}{' '}
                                        bills
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                        Collected
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(
                                            billKpis?.totalCollected,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {billKpis?.paidCount?.toLocaleString()}{' '}
                                        paid
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                        Due
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {formatCurrency(billKpis?.totalUnpaid)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {billKpis?.unpaidCount?.toLocaleString()}{' '}
                                        unpaid
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                                    <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">
                                        Invoices
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Services & other fees
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/40 p-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                                        Billed
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-foreground">
                                        {formatCurrency(
                                            invoiceKpis?.totalBilled,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {invoiceKpis?.totalCount?.toLocaleString()}{' '}
                                        invs
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                        Collected
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(
                                            invoiceKpis?.totalCollected,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {invoiceKpis?.paidCount?.toLocaleString()}{' '}
                                        paid
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400">
                                        Due
                                    </p>
                                    <p className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {formatCurrency(
                                            invoiceKpis?.totalUnpaid,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {invoiceKpis?.unpaidCount?.toLocaleString()}{' '}
                                        unpaid
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Settlement trend (12 months)
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Collected vs outstanding by month
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={trendConfig}
                                className="h-[320px] w-full"
                            >
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 16,
                                        right: 16,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="hsl(var(--border))"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const [y, m] = val.split('-');
                                            return new Date(
                                                y,
                                                m - 1,
                                            ).toLocaleString('en-US', {
                                                month: 'short',
                                            });
                                        }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) =>
                                            v >= 1000
                                                ? `${(v / 1000).toFixed(0)}k`
                                                : v
                                        }
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="paid"
                                        stackId="a"
                                        radius={[0, 0, 0, 0]}
                                        fill="hsl(var(--chart-2))"
                                    >
                                        <LabelList
                                            dataKey="paid"
                                            position="top"
                                            offset={6}
                                            className="fill-muted-foreground"
                                            fontSize={10}
                                            formatter={(v) =>
                                                v > 0 ? formatCurrency(v) : ''
                                            }
                                        />
                                    </Bar>
                                    <Bar
                                        dataKey="unpaid"
                                        stackId="a"
                                        radius={[4, 4, 0, 0]}
                                        fill="hsl(var(--chart-5))"
                                    >
                                        <LabelList
                                            dataKey="unpaid"
                                            position="top"
                                            offset={6}
                                            className="fill-muted-foreground"
                                            fontSize={10}
                                            formatter={(v) =>
                                                v > 0 ? formatCurrency(v) : ''
                                            }
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Revenue by tariff
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Share of collected amount
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={tariffConfig}
                                className="h-[320px] w-full"
                            >
                                <BarChart
                                    data={tariffs}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 48,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={8}
                                        axisLine={false}
                                        width={72}
                                        fontSize={11}
                                    />
                                    <XAxis type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="collected"
                                        layout="vertical"
                                        radius={[0, 4, 4, 0]}
                                    >
                                        <LabelList
                                            dataKey="collected"
                                            position="right"
                                            offset={8}
                                            className="fill-foreground"
                                            fontSize={11}
                                            formatter={(value) => {
                                                const total = tariffs.reduce(
                                                    (a, c) =>
                                                        a + (c.collected || 0),
                                                    0,
                                                );
                                                return total > 0
                                                    ? `${((value / total) * 100).toFixed(0)}%`
                                                    : '';
                                            }}
                                        />
                                        {tariffs.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={`hsl(var(--chart-${(i % 5) + 1}))`}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tariff table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">
                                    Tariff breakdown
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Billed, collected, and collection rate by
                                    plan
                                </p>
                            </div>
                            <Badge variant="outline" className="w-fit">
                                All zones
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-border/60">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold">
                                            Tariff plan
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Billed
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Collected
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Outstanding
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Rate
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tariffs.map((tariff, index) => {
                                        const totalBilled =
                                            Number(tariff.total_billed) || 0;
                                        const collected =
                                            Number(tariff.collected) || 0;
                                        const outstanding = Math.max(
                                            0,
                                            Math.round(
                                                (totalBilled - collected) * 100,
                                            ) / 100,
                                        );
                                        const rate =
                                            totalBilled > 0
                                                ? (collected / totalBilled) *
                                                  100
                                                : 0;
                                        const key =
                                            tariff.id != null
                                                ? `tariff-${tariff.id}`
                                                : `tariff-${index}`;
                                        return (
                                            <TableRow
                                                key={key}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {tariff.name ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground tabular-nums">
                                                    {formatCurrency(
                                                        totalBilled,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                                                    {formatCurrency(collected)}
                                                </TableCell>
                                                <TableCell className="text-right text-amber-600 tabular-nums dark:text-amber-400">
                                                    {formatCurrency(
                                                        outstanding,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            rate >= 90
                                                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                                : rate >= 70
                                                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                                                  : 'bg-muted'
                                                        }
                                                    >
                                                        {Number.isFinite(rate)
                                                            ? rate.toFixed(1)
                                                            : '0.0'}
                                                        %
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        {tariffs.length === 0 && (
                            <p className="py-12 text-center text-sm text-muted-foreground">
                                No tariff data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
