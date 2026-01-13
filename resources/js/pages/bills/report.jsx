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
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    Filter,
    Receipt,
} from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export default function BillReport({
    monthlyTrend,
    billingByTariff,
    billingByZone,
    kpis,
    filters,
    tariffs,
    zones,
}) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Bills', href: route('bills') },
        { title: 'Reports', href: route('bills.report') },
    ];

    const chartConfig = {
        paid: {
            label: 'Paid Amount',
            color: 'hsl(var(--chart-2))',
        },
        unpaid: {
            label: 'Unpaid Amount',
            color: 'hsl(var(--chart-5))',
        },
    };

    const handleFilterChange = (key, value) => {
        router.get(
            route('bills.report'),
            {
                ...filters,
                [key]: value === 'all' ? null : value,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleExport = () => {
        window.location.href = route('bills.export', filters || {});
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Reports" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Billing Reports
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                Filters:
                            </span>
                        </div>
                        <Select
                            value={filters.tariff_id?.toString() || 'all'}
                            onValueChange={(val) =>
                                handleFilterChange('tariff_id', val)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Tariffs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tariffs</SelectItem>
                                {tariffs.map((t) => (
                                    <SelectItem
                                        key={t.id}
                                        value={t.id.toString()}
                                    >
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.zone_id?.toString() || 'all'}
                            onValueChange={(val) =>
                                handleFilterChange('zone_id', val)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Zones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Zones</SelectItem>
                                {zones.map((z) => (
                                    <SelectItem
                                        key={z.id}
                                        value={z.id.toString()}
                                    >
                                        {z.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* KPI Cards - Row 1: Counts */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-l-4 border-l-primary shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                All Bills
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {kpis.allBillsCount?.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Total invoices generated
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Paid Bills
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-emerald-600">
                                {kpis.paidBillsCount?.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Fully paid invoices
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Unpaid Bills
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-amber-600">
                                {kpis.unpaidBillsCount?.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Pending or partial payments
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Overdue Bills
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-red-600">
                                {kpis.overdueBillsCount?.toLocaleString()}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Bills past due date
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 12-Month Performance Line Chart */}
                <div className="grid gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>
                                    12-Month Billing Performance
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Trends for Paid vs Unpaid bill amounts over
                                    time
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="h-[400px] w-full"
                            >
                                <LineChart
                                    data={monthlyTrend}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 20,
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
                                            value.toLocaleString()
                                        }
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(label) => {
                                                    const [year, month] =
                                                        label.split('-');
                                                    return new Date(
                                                        year,
                                                        month - 1,
                                                    ).toLocaleString('en-US', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    });
                                                }}
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="paid"
                                        stroke="var(--color-paid)"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: 'var(--color-paid)',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="unpaid"
                                        stroke="var(--color-unpaid)"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                            fill: 'var(--color-unpaid)',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Breakdowns */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Collection by Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Zone</TableHead>
                                        <TableHead className="text-right">
                                            Total Bills
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Unpaid
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Overdue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingByZone.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(
                                                    item.total,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                {Number(
                                                    item.paid,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-600">
                                                {Number(
                                                    item.unpaid,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                {Number(
                                                    item.overdue,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Collection by Tariff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tariff</TableHead>
                                        <TableHead className="text-right">
                                            Total Bills
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Paid
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Unpaid
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Overdue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingByTariff.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {Number(
                                                    item.total,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">
                                                {Number(
                                                    item.paid,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-600">
                                                {Number(
                                                    item.unpaid,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                {Number(
                                                    item.overdue,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="py-8"></div>
        </AppLayout>
    );
}
