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
import { CreditCard, Download, Receipt } from 'lucide-react';
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
            label: 'Paid Amount',
            color: 'hsl(var(--chart-2))',
        },
        unpaid: {
            label: 'Unpaid Amount',
            color: 'hsl(var(--chart-5))',
        },
    };

    const typeConfig = revenueByType.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {});
    const tariffConfig = tariffRevenue.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {});

    const zoneConfig = zoneRevenue.reduce((acc, item, index) => {
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
            // Construct YYYY-MM explicitly using local time components to avoid timezone shifts
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const monthStr = `${year}-${month}`;

            const found = monthlyTrend.find((m) => m.month === monthStr);
            months.push(
                found
                    ? {
                          month: monthStr,
                          paid: Number(found.paid),
                          unpaid: Number(found.unpaid),
                      }
                    : {
                          month: monthStr,
                          paid: 0,
                          unpaid: 0,
                          total: 0,
                      },
            );
        }
        return months;
    })();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Reports" />
            <div className="p- flex flex-col gap-2">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Financial Insights
                        </h1>
                        <p className="text-muted-foreground">
                            Holistic view of billing, settlement, and revenue
                            performance.
                        </p>
                    </div>
                </div>

                {/* Top Level Summary Card */}

                {/* KPI Breakdown Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Water Bills KPI */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-3xl" />
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Water Bills
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Consumption Revenue
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 grid grid-cols-3 divide-x text-center">
                                <div className="px-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Issued
                                    </p>
                                    <div className="mt-1 text-lg font-bold">
                                        {formatCurrency(billKpis.totalBilled)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {billKpis.totalCount?.toLocaleString()}{' '}
                                        bills
                                    </p>
                                </div>
                                <div className="px-2">
                                    <p className="text-xs font-medium text-emerald-600 uppercase">
                                        Paid
                                    </p>
                                    <div className="mt-1 text-lg font-bold text-emerald-600">
                                        {formatCurrency(
                                            billKpis.totalCollected,
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {billKpis.paidCount?.toLocaleString()}{' '}
                                        paid
                                    </p>
                                </div>
                                <div className="px-2">
                                    <p className="text-xs font-medium text-amber-600 uppercase">
                                        Due
                                    </p>
                                    <div className="mt-1 text-lg font-bold text-amber-600">
                                        {formatCurrency(billKpis.totalUnpaid)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {billKpis.unpaidCount?.toLocaleString()}{' '}
                                        unpaid
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices KPI */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-500/10 blur-3xl" />
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                <CreditCard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    Services & Fees
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Other Invoices
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 grid grid-cols-3 divide-x text-center">
                                <div className="px-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        Issued
                                    </p>
                                    <div className="mt-1 text-lg font-bold">
                                        {formatCurrency(
                                            invoiceKpis.totalBilled,
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {invoiceKpis.totalCount?.toLocaleString()}{' '}
                                        invs
                                    </p>
                                </div>
                                <div className="px-2">
                                    <p className="text-xs font-medium text-emerald-600 uppercase">
                                        Paid
                                    </p>
                                    <div className="mt-1 text-lg font-bold text-emerald-600">
                                        {formatCurrency(
                                            invoiceKpis.totalCollected,
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {invoiceKpis.paidCount?.toLocaleString()}{' '}
                                        paid
                                    </p>
                                </div>
                                <div className="px-2">
                                    <p className="text-xs font-medium text-amber-600 uppercase">
                                        Due
                                    </p>
                                    <div className="mt-1 text-lg font-bold text-amber-600">
                                        {formatCurrency(
                                            invoiceKpis.totalUnpaid,
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {invoiceKpis.unpaidCount?.toLocaleString()}{' '}
                                        unpaid
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Trend Chart */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Settlement Trends (12 Months)</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Tracking collection performance over time
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={trendConfig}
                                className="h-[300px] w-full"
                            >
                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 10,
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
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const [year, month] =
                                                val.split('-');
                                            return new Date(
                                                year,
                                                month - 1,
                                            ).toLocaleString('en-US', {
                                                month: 'short',
                                            });
                                        }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) =>
                                            `${(value / 1000).toFixed(0)}k`
                                        }
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar dataKey="paid" radius={[4, 4, 0, 0]}>
                                        <LabelList
                                            dataKey="paid"
                                            position="top"
                                            offset={12}
                                            className="fill-foreground"
                                            fontSize={12}
                                            formatter={(value) =>
                                                value > 0
                                                    ? formatCurrency(value)
                                                    : ''
                                            }
                                        />
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Tariff Performance Bar Chart */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Tariff Performance</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Revenue breakdown by tariff
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={tariffConfig}
                                className="h-[300px] w-full"
                            >
                                <BarChart
                                    data={tariffRevenue}
                                    layout="vertical"
                                    margin={{
                                        top: 0,
                                        right: 30, // Extra space for labels
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        width={80}
                                        fontSize={12}
                                    />
                                    <XAxis type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="collected"
                                        layout="vertical"
                                        radius={4}
                                    >
                                        <LabelList
                                            dataKey="collected"
                                            position="right"
                                            offset={8}
                                            className="fill-foreground"
                                            fontSize={12}
                                            formatter={(value) => {
                                                const total =
                                                    tariffRevenue.reduce(
                                                        (acc, cur) =>
                                                            acc + cur.collected,
                                                        0,
                                                    );
                                                return `${((value / total) * 100).toFixed(0)}%`;
                                            }}
                                        />
                                        {tariffRevenue.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Tariff Performance Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Tariff Performance</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Detailed breakdown by tariff plan
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() =>
                                        (window.location.href =
                                            route('payments.export'))
                                    }
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Export
                                    </span>
                                </Button>
                                <Badge variant="secondary">All Zones</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tariff Plan</TableHead>
                                    <TableHead className="text-right">
                                        Total Billed
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Collected
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Outstanding
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Rate
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tariffRevenue.map((tariff) => {
                                    const collectionRate =
                                        tariff.total_billed > 0
                                            ? (tariff.collected /
                                                  tariff.total_billed) *
                                              100
                                            : 0;
                                    return (
                                        <TableRow key={tariff.name}>
                                            <TableCell className="font-medium">
                                                {tariff.name}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {formatCurrency(
                                                    tariff.total_billed,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                {formatCurrency(
                                                    tariff.collected,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-amber-600">
                                                {formatCurrency(
                                                    tariff.outstanding,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={
                                                        collectionRate >= 90
                                                            ? 'default' // heavily styled by default usually means primary color
                                                            : collectionRate >=
                                                                70
                                                              ? 'secondary'
                                                              : 'outline'
                                                    }
                                                    className={
                                                        collectionRate >= 90
                                                            ? 'border-transparent bg-emerald-500 hover:bg-emerald-600'
                                                            : collectionRate <
                                                                70
                                                              ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                              : ''
                                                    }
                                                >
                                                    {collectionRate.toFixed(1)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {tariffRevenue.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No tariff data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
