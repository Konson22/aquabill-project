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
import { formatCurrency } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Banknote,
    CreditCard,
    FileBarChart,
    FilePieChart,
    FileSpreadsheet,
    FileText,
    Receipt,
    Wallet,
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

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '#',
    },
    {
        title: 'Finance',
        href: '#',
    },
];

export default function DashboardFinance({
    stats,
    revenueTrend,
    recentPayments,
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 py-6">
                {/* Top Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-emerald-500 transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Revenue Collected
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats.totalCollected)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Lifetime collections
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Collections Today
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.collectedToday)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Received in the last 24h
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500 transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-none pb-2 shadow-none">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending Revenue
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {formatCurrency(stats.totalPending)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Outstanding bills & invoices
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bills & Invoices Overview */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Bills Breakdown */}
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Bills Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Monthly water bills statistics
                                    </CardDescription>
                                </div>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 border-r pr-4">
                                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                                        Total Count
                                    </span>
                                    <div className="text-xl font-bold">
                                        {stats.billStats.total}
                                    </div>
                                </div>
                                <div className="space-y-1 pl-4">
                                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                                        Unpaid Amount
                                    </span>
                                    <div className="text-xl font-bold text-orange-600">
                                        {formatCurrency(stats.billStats.amount)}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <div className="flex-1 rounded-lg bg-emerald-50 p-3 text-center">
                                    <div className="text-sm font-medium text-emerald-700">
                                        Paid
                                    </div>
                                    <div className="text-lg font-bold text-emerald-800">
                                        {stats.billStats.paid}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg bg-orange-50 p-3 text-center">
                                    <div className="text-sm font-medium text-orange-700">
                                        Unpaid
                                    </div>
                                    <div className="text-lg font-bold text-orange-800">
                                        {stats.billStats.unpaid}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg bg-red-50 p-3 text-center text-red-700">
                                    <div className="text-sm font-medium text-red-700">
                                        Overdue
                                    </div>
                                    <div className="text-lg font-bold text-red-800">
                                        {stats.billStats.overdue}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices Breakdown */}
                    <Card className="overflow-hidden transition-shadow hover:shadow-md">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Invoices Overview
                                    </CardTitle>
                                    <CardDescription>
                                        One-time installation & service fees
                                    </CardDescription>
                                </div>
                                <Receipt className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 border-r pr-4">
                                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                                        Total Count
                                    </span>
                                    <div className="text-xl font-bold">
                                        {stats.invoiceStats.total}
                                    </div>
                                </div>
                                <div className="space-y-1 pl-4">
                                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                                        Unpaid Amount
                                    </span>
                                    <div className="text-xl font-bold text-orange-600">
                                        {formatCurrency(
                                            stats.invoiceStats.amount,
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <div className="flex-1 rounded-lg bg-emerald-50 p-3 text-center">
                                    <div className="text-sm font-medium text-emerald-700">
                                        Paid
                                    </div>
                                    <div className="text-lg font-bold text-emerald-800">
                                        {stats.invoiceStats.paid}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg bg-orange-50 p-3 text-center">
                                    <div className="text-sm font-medium text-orange-700">
                                        Unpaid
                                    </div>
                                    <div className="text-lg font-bold text-orange-800">
                                        {stats.invoiceStats.unpaid}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg bg-red-50 p-3 text-center">
                                    <div className="text-sm font-medium text-red-700">
                                        Overdue
                                    </div>
                                    <div className="text-lg font-bold text-red-800">
                                        {stats.invoiceStats.overdue}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Revenue Trend Chart */}
                    <Card className="transition-shadow hover:shadow-md lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>
                                Monthly collection performance for the last 6
                                months.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueTrend}>
                                        <defs>
                                            <linearGradient
                                                id="colorRevenue"
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
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            className="stroke-muted"
                                        />
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
                                                formatCurrency(value)
                                            }
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
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(var(--primary))"
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Payments Table */}
                    <Card className="transition-shadow hover:shadow-md lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Payments</CardTitle>
                                    <CardDescription>
                                        Latest financial transactions
                                    </CardDescription>
                                </div>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentPayments.map((payment) => (
                                            <TableRow
                                                key={payment.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {payment.customer}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {payment.type} •{' '}
                                                            {payment.date}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-emerald-600">
                                                            {formatCurrency(
                                                                payment.amount,
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">
                                                            {payment.method}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {recentPayments.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No recent payments recorded.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <a
                                    href="/finance/payments"
                                    className="flex items-center text-xs font-semibold text-primary hover:underline"
                                >
                                    View all payments{' '}
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Links Section */}
                <div>
                    <h3 className="mb-4 text-lg font-semibold tracking-tight">
                        Quick Reports
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href={route('payments.report')}>
                            <Card className="cursor-pointer shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Payment Reports
                                    </CardTitle>
                                    <FileBarChart className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        View settlement trends, tariff revenue,
                                        and zone contributions.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href={route('meter-readings.report')}>
                            <Card className="cursor-pointer shadow-sm transition-all hover:border-emerald-500 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Meter Reading Reports
                                    </CardTitle>
                                    <FilePieChart className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        Analyze consumption patterns by tariff
                                        and zone.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href={route('bills.report')}>
                            <Card className="cursor-pointer shadow-sm transition-all hover:border-amber-500 hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Billing Reports
                                    </CardTitle>
                                    <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        Track billing performance, paid vs
                                        unpaid trends.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
