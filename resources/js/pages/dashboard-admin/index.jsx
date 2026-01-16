import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    FileBarChart,
    FilePieChart,
    FileSpreadsheet,
    FileText,
    Layers,
    ShieldAlert,
    TrendingUp,
    Users,
    Wrench,
    Zap,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function Dashboard({ stats, chartData, usageByCategory }) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '#',
        },
        {
            title: 'Admin Overview',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 py-6">
                {/* Quick Links Section */}
                <div className="mb-2">
                    <h3 className="mb-3 text-sm font-semibold tracking-tight text-foreground/90">
                        Quick Reports
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Link href={route('payments.report')}>
                            <Card className="group relative overflow-hidden border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-transparent transition-all hover:border-blue-300 hover:shadow-sm dark:border-blue-900/50 dark:from-blue-900/20">
                                <div className="absolute top-0 right-0 -m-2 h-16 w-16 rounded-full bg-blue-500/10 blur-xl transition-all group-hover:bg-blue-500/20" />
                                <div className="flex items-center gap-3 p-3">
                                    <div className="rounded-lg bg-blue-100 p-2 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:ring-blue-800">
                                        <FileBarChart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-blue-950 dark:text-blue-100">
                                            Payment Reports
                                        </div>
                                        <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">
                                            Settlement trends & revenue
                                            analytics
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                        <Link href={route('meter-readings.report')}>
                            <Card className="group relative overflow-hidden border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-transparent transition-all hover:border-emerald-300 hover:shadow-sm dark:border-emerald-900/50 dark:from-emerald-900/20">
                                <div className="absolute top-0 right-0 -m-2 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl transition-all group-hover:bg-emerald-500/20" />
                                <div className="flex items-center gap-3 p-3">
                                    <div className="rounded-lg bg-emerald-100 p-2 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:ring-emerald-800">
                                        <FilePieChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-emerald-950 dark:text-emerald-100">
                                            Meter Reports
                                        </div>
                                        <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-300/80">
                                            Consumption patterns & zone stats
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                        <Link href={route('bills.report')}>
                            <Card className="group relative overflow-hidden border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-transparent transition-all hover:border-amber-300 hover:shadow-sm dark:border-amber-900/50 dark:from-amber-900/20">
                                <div className="absolute top-0 right-0 -m-2 h-16 w-16 rounded-full bg-amber-500/10 blur-xl transition-all group-hover:bg-amber-500/20" />
                                <div className="flex items-center gap-3 p-3">
                                    <div className="rounded-lg bg-amber-100 p-2 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:ring-amber-800">
                                        <FileSpreadsheet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-amber-950 dark:text-amber-100">
                                            Billing Reports
                                        </div>
                                        <p className="text-xs font-medium text-amber-700/80 dark:text-amber-300/80">
                                            Performance tracking & trends
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Financial Overview Card */}
                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Financial Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Generated */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-600">
                                        Total Bills Generated
                                    </span>
                                    <Layers className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {(
                                        stats.totalBills + stats.totalInvoices
                                    ).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Bills & Invoices issued
                                </p>
                            </div>

                            {/* Combined Paid */}
                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-600">
                                        Total Paid Bills
                                    </span>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {(
                                        stats.paidBills + stats.paidInvoices
                                    ).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Successfully collected
                                </p>
                            </div>

                            {/* Combined Unpaid */}
                            <div className="flex flex-col gap-1 lg:border-l lg:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-amber-600">
                                        Total Unpaid Bills
                                    </span>
                                    <FileText className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-amber-600">
                                    {(
                                        stats.unpaidBills + stats.unpaidInvoices
                                    ).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pending payments
                                </p>
                            </div>

                            {/* Combined Overdue */}
                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-destructive">
                                        Total Overdue Bills
                                    </span>
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </div>
                                <div className="text-2xl font-bold text-destructive">
                                    {(
                                        stats.overdueBillsCount +
                                        stats.overdueInvoices
                                    ).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Requires attention
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Meters Status Card */}
                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Meters Status Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        All Meters
                                    </span>
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.totalMeters.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total registered
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-600">
                                        Active
                                    </span>
                                    <Zap className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {stats.activeMeters.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently running
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 lg:border-l lg:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground/60">
                                        Inactive
                                    </span>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
                                </div>
                                <div className="text-2xl font-bold text-muted-foreground/60">
                                    {stats.inactiveMeters.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Not in use
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-destructive">
                                        Damage
                                    </span>
                                    <ShieldAlert className="h-4 w-4 text-destructive" />
                                </div>
                                <div className="text-2xl font-bold text-destructive">
                                    {stats.damageMeters.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Needs repair
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 lg:border-l lg:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-orange-600">
                                        Maintenance
                                    </span>
                                    <Wrench className="h-4 w-4 text-orange-500" />
                                </div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {stats.maintenanceMeters.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Being serviced
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Operations & Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Total Customers
                                    </span>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.totalCustomers.toLocaleString()}
                                </div>
                                <p className="mt-1 flex items-center text-xs text-muted-foreground">
                                    <span
                                        className={`mr-1 flex items-center ${stats.customersTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                                    >
                                        {stats.customersTrend > 0 ? '+' : ''}
                                        {stats.customersTrend}%{' '}
                                        <TrendingUp className="ml-0.5 h-3 w-3" />
                                    </span>
                                    from last month
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Active Tariffs
                                    </span>
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.activeTariffsCount}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Configured tariffs
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Readings (Month)
                                    </span>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-2xl font-bold">
                                    {stats.readingsThisMonth.toLocaleString()}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Recorded this month
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 md:border-l md:pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-600">
                                        Annual Consumption
                                    </span>
                                    <Zap className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.totalConsumptionThisYear.toLocaleString()}{' '}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        m³
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Unit consumption (Year)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 transition-shadow hover:shadow-md">
                        <CardHeader>
                            <CardTitle>Water Usage Overview</CardTitle>
                            <CardDescription>
                                Monthly water consumption (m³) for the current
                                year.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient
                                                id="colorTotal"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="hsl(var(--primary))"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="hsl(var(--primary))"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                `${value} m³`
                                            }
                                        />
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            className="stroke-muted"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor:
                                                    'hsl(var(--popover))',
                                                borderColor:
                                                    'hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            itemStyle={{
                                                color: 'hsl(var(--popover-foreground))',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="col-span-3">
                        <Card className="h-full transition-shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle>Usage Breakdown</CardTitle>
                                <CardDescription>
                                    Distribution of water usage by tariff
                                    category (m³).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">
                                                Usage
                                            </TableHead>
                                            <TableHead className="text-right">
                                                %
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usageByCategory.map((item) => {
                                            const total =
                                                usageByCategory.reduce(
                                                    (acc, curr) =>
                                                        acc + curr.value,
                                                    0,
                                                );
                                            const percentage =
                                                total > 0
                                                    ? (
                                                          (item.value / total) *
                                                          100
                                                      ).toFixed(1)
                                                    : 0;

                                            return (
                                                <TableRow key={item.name}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.fill,
                                                                }}
                                                            />
                                                            {item.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.value.toLocaleString()}{' '}
                                                        m³
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        {percentage}%
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {usageByCategory.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No usage data available.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
