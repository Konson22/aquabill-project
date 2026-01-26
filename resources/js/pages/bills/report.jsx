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
import { formatCompactNumber } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Download,
    Filter,
    Layers,
    MapPin,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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

    const kpiItems = [
        {
            title: 'All Bills',
            value: kpis.allBillsCount,
            description: 'Total invoices generated',
            icon: Receipt,
            color: 'text-primary',
            bg: 'bg-primary/10',
            glow: 'group-hover:bg-primary/20',
        },
        {
            title: 'Paid Bills',
            value: kpis.paidBillsCount,
            description: 'Fully paid invoices',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            glow: 'group-hover:bg-emerald-500/20',
        },
        {
            title: 'Unpaid Bills',
            value: kpis.unpaidBillsCount,
            description: 'Pending/Partial payments',
            icon: AlertCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            glow: 'group-hover:bg-amber-500/20',
        },
        {
            title: 'Overdue Bills',
            value: kpis.overdueBillsCount,
            description: 'Bills past due date',
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            glow: 'group-hover:bg-red-500/20',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Reports" />
            <div className="flex flex-col gap-8 px-4 py-6">
                {/* Header Section */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary">
                            <BarChart3 className="h-5 w-5" />
                            <span className="text-sm font-bold tracking-wider uppercase">
                                Analytics
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">
                            Billing Reports
                        </h1>
                        <p className="text-muted-foreground">
                            Analyze your collection performance and debt status.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 p-1.5 shadow-sm">
                            <div className="flex items-center gap-2 px-2 py-1 text-sm font-bold text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                FILTERS
                            </div>
                            <Select
                                value={filters.tariff_id?.toString() || 'all'}
                                onValueChange={(val) =>
                                    handleFilterChange('tariff_id', val)
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px] rounded-lg border-none bg-background shadow-none ring-offset-transparent focus:ring-0">
                                    <SelectValue placeholder="All Tariffs" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                                    <SelectItem value="all">
                                        All Tariffs
                                    </SelectItem>
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
                                <SelectTrigger className="h-9 w-[160px] rounded-lg border-none bg-background shadow-none ring-offset-transparent focus:ring-0">
                                    <SelectValue placeholder="All Zones" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                                    <SelectItem value="all">
                                        All Zones
                                    </SelectItem>
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
                        </div>

                        <Button
                            variant="default"
                            onClick={handleExport}
                            className="group flex h-12 items-center gap-2 rounded-xl px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                        >
                            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                            <span className="font-bold">Export Report</span>
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpiItems.map((item) => (
                        <Card
                            key={item.title}
                            className="group relative overflow-hidden border-border/50 bg-muted/30 transition-all duration-300 hover:border-border hover:bg-background hover:shadow-2xl hover:shadow-black/5 dark:bg-card/50"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                                    {item.title}
                                </CardTitle>
                                <div
                                    className={cn(
                                        'rounded-lg p-2 transition-all duration-500 group-hover:scale-110',
                                        item.bg,
                                    )}
                                >
                                    <item.icon
                                        className={cn('h-4 w-4', item.color)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-4xl font-black tracking-tighter text-foreground">
                                        {item.value?.toLocaleString()}
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                    {item.description}
                                </p>
                            </CardContent>
                            <div
                                className={cn(
                                    'absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-20',
                                    item.bg,
                                )}
                            />
                        </Card>
                    ))}
                </div>

                {/* Performance Chart */}
                <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
                    <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black tracking-tight">
                                    Financial Performance
                                </CardTitle>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Revenue vs Outstanding balance trends (12
                                    Months)
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-lg border-primary/20 bg-background px-3 py-1 font-bold text-primary"
                            >
                                YEARLY VIEW
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ChartContainer
                            config={chartConfig}
                            className="h-[400px] w-full"
                        >
                            <AreaChart
                                data={monthlyTrend}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 10,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorPaid"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-paid)"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-paid)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="colorUnpaid"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-unpaid)"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-unpaid)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="hsl(var(--muted-foreground))"
                                    opacity={0.1}
                                />
                                <XAxis
                                    dataKey="month"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => {
                                        const [year, month] = val.split('-');
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
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        formatCompactNumber(value)
                                    }
                                />
                                <ChartTooltip
                                    cursor={{
                                        stroke: 'hsl(var(--primary))',
                                        strokeWidth: 1,
                                    }}
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
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="paid"
                                    stroke="var(--color-paid)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPaid)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="unpaid"
                                    stroke="var(--color-unpaid)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUnpaid)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Data Breakdowns */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">
                                        Collection by Zone
                                    </CardTitle>
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Geographical Performance
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-4 pl-6 text-xs font-black tracking-widest uppercase">
                                            Zone
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-black tracking-widest uppercase">
                                            Paid
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-black tracking-widest uppercase">
                                            Unpaid
                                        </TableHead>
                                        <TableHead className="pr-6 text-right text-xs font-black tracking-widest uppercase">
                                            Overdue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingByZone.map((item, i) => (
                                        <TableRow
                                            key={i}
                                            className="group hover:bg-muted/30"
                                        >
                                            <TableCell className="py-4 pl-6 font-bold">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-mono font-bold text-emerald-600">
                                                    {formatCompactNumber(
                                                        item.paid,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-mono font-bold text-amber-600">
                                                    {formatCompactNumber(
                                                        item.unpaid,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <span className="font-mono font-bold text-red-600">
                                                    {formatCompactNumber(
                                                        item.overdue,
                                                    )}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tight">
                                        Collection by Tariff
                                    </CardTitle>
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Category Distribution
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="py-4 pl-6 text-xs font-black tracking-widest uppercase">
                                            Category
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-black tracking-widest uppercase">
                                            Paid
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-black tracking-widest uppercase">
                                            Unpaid
                                        </TableHead>
                                        <TableHead className="pr-6 text-right text-xs font-black tracking-widest uppercase">
                                            Overdue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingByTariff.map((item, i) => (
                                        <TableRow
                                            key={i}
                                            className="group hover:bg-muted/30"
                                        >
                                            <TableCell className="py-4 pl-6 font-bold">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-mono font-bold text-emerald-600">
                                                    {formatCompactNumber(
                                                        item.paid,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-mono font-bold text-amber-600">
                                                    {formatCompactNumber(
                                                        item.unpaid,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <span className="font-mono font-bold text-red-600">
                                                    {formatCompactNumber(
                                                        item.overdue,
                                                    )}
                                                </span>
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

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
