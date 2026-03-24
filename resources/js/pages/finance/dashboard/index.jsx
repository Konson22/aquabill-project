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
import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { Activity, ArrowUpRight } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import BillsAndNvoicesOverview from './sections/bills_and_nvoices_overview';
import QuickLinks from './sections/quick-links';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/',
    },
];

export default function DashboardFinance({
    stats,
    revenueTrend,
    overdueBills,
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 py-6">
                <QuickLinks />

                <BillsAndNvoicesOverview stats={stats} />

                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Revenue Trend Chart */}
                    <Card className="transition-shadow hover:shadow-md lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>
                                Monthly collection performance for the current
                                year.
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
                                                formatCompactNumber(value)
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
                                                `${formatCompactNumber(value)} SSP`
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

                    {/* Overdue Bills Table */}
                    <Card className="border-red-100 transition-shadow hover:shadow-md lg:col-span-3 dark:border-red-900/30">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-red-600 dark:text-red-400">
                                        Overdue Bills
                                    </CardTitle>
                                    <CardDescription>
                                        Unpaid for more than 30 days
                                    </CardDescription>
                                </div>
                                <Activity className="h-4 w-4 text-red-500" />
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
                                        {overdueBills.map((bill) => (
                                            <TableRow
                                                key={bill.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {bill.customer}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Due: {bill.due_date}{' '}
                                                            •{' '}
                                                            <span className="font-medium text-red-500">
                                                                {
                                                                    bill.days_overdue
                                                                }{' '}
                                                                days late
                                                            </span>
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-red-600">
                                                            {formatCurrency(
                                                                bill.amount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {overdueBills.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={2}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Perfect! No overdue bills
                                                    found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <a
                                    href="/bills?status=overdue"
                                    className="flex items-center text-xs font-semibold text-primary hover:underline"
                                >
                                    View all overdue bills{' '}
                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
