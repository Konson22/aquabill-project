import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';

const MONTH_OPTIONS = (() => {
    const opts = [{ value: 'all', label: 'All time' }];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        opts.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            }),
        });
    }
    return opts;
})();

export default function GeneralReport({
    stats = {},
    usageByZone = [],
    highlights = [],
    customerStats = {},
    filters = {},
}) {
    const month = filters.month || 'all';

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'General Report', href: '#' },
    ];

    const onMonthChange = (value) => {
        const query = value === 'all' ? {} : { month: value };
        router.get(route('general-report'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Report" />
            <div className="mx-auto max-w-6xl space-y-8 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <BarChart3 className="h-7 w-7" />
                            General Report
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            System-wide billing, payments, and usage overview
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:w-64">
                        <Label htmlFor="report-month">Period</Label>
                        <Select value={month} onValueChange={onMonthChange}>
                            <SelectTrigger id="report-month">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTH_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {highlights.map((h) => (
                        <Card key={h.label}>
                            <CardHeader className="pb-2">
                                <CardDescription>{h.label}</CardDescription>
                                <CardTitle className="text-2xl">{h.value}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    {h.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total bills</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.totalBills ?? 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Paid: {stats.paidBills ?? 0} · Unpaid:{' '}
                            {stats.unpaidBills ?? 0}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total paid amount</CardDescription>
                            <CardTitle className="text-2xl">
                                {formatCurrency(stats.totalPaidAmount ?? 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Outstanding</CardDescription>
                            <CardTitle className="text-2xl text-amber-700">
                                {formatCurrency(stats.outstandingAmount ?? 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Consumption (m³)</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.totalConsumption ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Payment rate</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.paymentRate ?? 0}%
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overdue bills</CardDescription>
                            <CardTitle className="text-2xl">
                                {stats.overdueBillsCount ?? 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground">
                            Amount:{' '}
                            {formatCurrency(stats.overdueBillsAmount ?? 0)}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage by zone</CardTitle>
                        <CardDescription>
                            Water consumption (m³) for the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Zone</TableHead>
                                    <TableHead className="text-right">
                                        Usage (m³)
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usageByZone.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className="text-center text-muted-foreground"
                                        >
                                            No data
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    usageByZone.map((row) => (
                                        <TableRow key={row.name}>
                                            <TableCell className="font-medium">
                                                {row.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.value}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customers & meters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Customers
                                </span>
                                <span className="font-medium">
                                    {customerStats.totalCustomers ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Active customers
                                </span>
                                <span className="font-medium">
                                    {customerStats.activeCustomers ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Suspended
                                </span>
                                <span className="font-medium">
                                    {customerStats.suspendedCustomers ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Meters (total)
                                </span>
                                <span className="font-medium">
                                    {customerStats.totalMeters ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Meters active
                                </span>
                                <span className="font-medium">
                                    {customerStats.metersActive ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between border-b py-2">
                                <span className="text-muted-foreground">
                                    Meters inactive
                                </span>
                                <span className="font-medium">
                                    {customerStats.metersInactive ?? 0}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">
                                    Maintenance / damage
                                </span>
                                <span className="font-medium">
                                    {customerStats.metersMaintenance ?? 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
