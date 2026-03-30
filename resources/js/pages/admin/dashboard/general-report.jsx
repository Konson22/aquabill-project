import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
    Banknote,
    BarChart3,
    CalendarRange,
    Download,
    Droplets,
    FileSpreadsheet,
    MapPin,
    Tag,
    Users,
    Wallet,
} from 'lucide-react';

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

function StatRow({ label, children, variant = 'default' }) {
    const tone =
        variant === 'warning'
            ? 'text-amber-700 dark:text-amber-400'
            : 'text-foreground';
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span
                className={`text-sm font-semibold tabular-nums tracking-tight ${tone}`}
            >
                {children}
            </span>
        </div>
    );
}

function SectionIcon({ children, className = '' }) {
    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ${className}`}
        >
            {children}
        </div>
    );
}

export default function GeneralReport({
    stats = {},
    usageByZone = [],
    usageByTariff = [],
    customerStats = {},
    filters = {},
}) {
    const month = filters.month || 'all';
    const periodLabel =
        MONTH_OPTIONS.find((o) => o.value === month)?.label ?? 'All time';

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

    const exportToExcel = () => {
        const params = { format: 'xlsx' };
        if (month && month !== 'all') {
            params.month = month;
        }
        window.location.href = route('general-report.export', params);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Report" />
            <div className="min-h-full bg-gradient-to-b from-muted/50 via-background to-background pb-12">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 shadow-inner ring-1 ring-primary/10">
                                    <BarChart3 className="h-7 w-7 text-primary" />
                                </div>
                                <div className="space-y-1.5">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        General report
                                    </h1>
                                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                                        Billing, collections, water usage by
                                        zone and tariff, and connection counts
                                        for the selected period.
                                    </p>
                                    <p className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 font-medium text-foreground">
                                            <CalendarRange className="h-3.5 w-3.5 text-primary" />
                                            {periodLabel}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <div className="flex flex-col gap-2 sm:min-w-[200px]">
                                    <Label
                                        htmlFor="report-month"
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        Period
                                    </Label>
                                    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-1 shadow-sm">
                                        <Select
                                            value={month}
                                            onValueChange={onMonthChange}
                                        >
                                            <SelectTrigger
                                                id="report-month"
                                                className="h-10 border-0 bg-background/80 shadow-sm"
                                            >
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONTH_OPTIONS.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    className="h-10 shrink-0 gap-2 shadow-md shadow-primary/15"
                                    onClick={exportToExcel}
                                >
                                    <FileSpreadsheet className="h-4 w-4" />
                                    Export Excel
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="overflow-hidden border-border/80 bg-card/80 shadow-sm transition-colors hover:border-primary/25">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Total consumption
                                </CardTitle>
                                <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600 dark:text-sky-400">
                                    <Droplets className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-5">
                                <p className="text-2xl font-bold tabular-nums tracking-tight">
                                    {Number(
                                        stats.totalConsumption ?? 0,
                                    ).toLocaleString()}{' '}
                                    <span className="text-base font-semibold text-muted-foreground">
                                        m³
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    For the selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-border/80 bg-card/80 shadow-sm transition-colors hover:border-primary/25">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Total bills
                                </CardTitle>
                                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
                                    <BarChart3 className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-5">
                                <p className="text-2xl font-bold tabular-nums tracking-tight">
                                    {stats.totalBills ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    In period
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-border/80 bg-card/80 shadow-sm transition-colors hover:border-primary/25">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Paid amount
                                </CardTitle>
                                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                    <Banknote className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-5">
                                <p className="text-2xl font-bold tabular-nums tracking-tight">
                                    {formatCurrency(
                                        stats.totalPaidAmount ?? 0,
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Payments in period
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border-border/80 bg-card/80 shadow-sm transition-colors hover:border-amber-500/30">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
                                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Outstanding
                                </CardTitle>
                                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
                                    <Wallet className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="pb-5">
                                <p className="text-2xl font-bold tabular-nums tracking-tight text-amber-700 dark:text-amber-400">
                                    {formatCurrency(
                                        stats.outstandingAmount ?? 0,
                                    )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Unpaid balance on bills
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-border/80 shadow-sm">
                        <CardHeader className="border-b border-border/80 bg-muted/25 pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <SectionIcon>
                                    <Banknote className="h-5 w-5" />
                                </SectionIcon>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Billing & payments
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        Counts and amounts for bills in the
                                        selected period.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/60">
                                <StatRow label="Total bills">
                                    {stats.totalBills ?? 0}
                                </StatRow>
                                <StatRow label="Pending bills">
                                    {stats.unpaidBills ?? 0}
                                </StatRow>
                                <StatRow label="Paid amount">
                                    {formatCurrency(
                                        stats.totalPaidAmount ?? 0,
                                    )}
                                </StatRow>
                                <StatRow label="Outstanding" variant="warning">
                                    {formatCurrency(
                                        stats.outstandingAmount ?? 0,
                                    )}
                                </StatRow>
                                <StatRow label="Overdue bills">
                                    {stats.overdueBillsCount ?? 0}
                                </StatRow>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="overflow-hidden border-border/80 shadow-sm">
                            <CardHeader className="border-b border-border/80 bg-muted/25 pb-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <SectionIcon>
                                        <MapPin className="h-5 w-5" />
                                    </SectionIcon>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            Usage by zone
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-relaxed">
                                            Total{' '}
                                            <span className="font-medium text-foreground">
                                                {Number(
                                                    stats.totalConsumption ??
                                                        0,
                                                ).toLocaleString()}{' '}
                                                m³
                                            </span>{' '}
                                            in period · breakdown by zone
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5">
                                <div className="overflow-hidden rounded-xl border border-border/80">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="font-semibold">
                                                    Zone
                                                </TableHead>
                                                <TableHead className="text-right font-semibold">
                                                    Usage (m³)
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usageByZone.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No data for this period
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                usageByZone.map((row) => (
                                                    <TableRow
                                                        key={row.name}
                                                        className="border-border/60"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {row.value}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden border-border/80 shadow-sm">
                            <CardHeader className="border-b border-border/80 bg-muted/25 pb-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <SectionIcon>
                                        <Tag className="h-5 w-5" />
                                    </SectionIcon>
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">
                                            Usage by tariff
                                        </CardTitle>
                                        <CardDescription className="text-sm leading-relaxed">
                                            Consumption attributed to each
                                            customer tariff for the period.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5">
                                <div className="overflow-hidden rounded-xl border border-border/80">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/80 bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="font-semibold">
                                                    Tariff
                                                </TableHead>
                                                <TableHead className="text-right font-semibold">
                                                    Usage (m³)
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usageByTariff.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        className="h-24 text-center text-muted-foreground"
                                                    >
                                                        No data for this period
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                usageByTariff.map((row) => (
                                                    <TableRow
                                                        key={
                                                            row.id ?? row.name
                                                        }
                                                        className="border-border/60"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {row.value}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-border/80 shadow-sm">
                        <CardHeader className="border-b border-border/80 bg-muted/25 pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <SectionIcon>
                                    <Users className="h-5 w-5" />
                                </SectionIcon>
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        Customers & meters
                                    </CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        Current registry totals (not filtered
                                        by report period).
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Customers
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.totalCustomers ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Active customers
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.activeCustomers ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Suspended
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.suspendedCustomers ??
                                            0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Meters (total)
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.totalMeters ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Meters active
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.metersActive ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3">
                                    <span className="text-muted-foreground">
                                        Meters inactive
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.metersInactive ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3 sm:col-span-2 lg:col-span-3">
                                    <span className="text-muted-foreground">
                                        Maintenance / damage
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {customerStats.metersMaintenance ?? 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
