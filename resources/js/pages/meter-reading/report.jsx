import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
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
import { Download, Droplets, Filter, Hash, TrendingUp, X } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';

const MONTH_OPTIONS = (() => {
    const opts = [{ value: 'all', label: 'All months' }];
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

export default function MeterReadingReport({
    monthlyConsumption,
    readingsByTariff,
    consumptionByTariff,
    consumptionByZone,
    totalReadings,
    totalConsumption,
    avgConsumption,
    overdueReadings = [],
    filters,
    tariffs,
    zones,
}) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Meter Readings', href: route('meter-readings') },
        { title: 'Reports', href: route('meter-readings.report') },
    ];

    const consumptionConfig = {
        total: {
            label: 'Total Consumption (m³)',
            color: 'hsl(var(--chart-1))',
        },
    };

    const tariffConfig = consumptionByTariff.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {});

    const zoneConfig = consumptionByZone.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
        };
        return acc;
    }, {});

    const monthOrder = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const monthAliases = {
        jan: 0,
        january: 0,
        feb: 1,
        february: 1,
        mar: 2,
        march: 2,
        apr: 3,
        april: 3,
        may: 4,
        jun: 5,
        june: 5,
        jul: 6,
        july: 6,
        aug: 7,
        august: 7,
        sep: 8,
        sept: 8,
        september: 8,
        oct: 9,
        october: 9,
        nov: 10,
        november: 10,
        dec: 11,
        december: 11,
    };

    const getMonthIndex = (item) => {
        const numericMonth =
            item.month ??
            item.month_number ??
            item.monthIndex ??
            item.month_index;
        if (Number.isInteger(numericMonth)) {
            return Math.min(Math.max(Number(numericMonth) - 1, 0), 11);
        }

        const label = item.name?.toString().toLowerCase();
        if (!label) return null;

        if (monthAliases[label] !== undefined) return monthAliases[label];
        const trimmed = label.slice(0, 3);
        if (monthAliases[trimmed] !== undefined) return monthAliases[trimmed];

        const numberMatch = label.match(/\b(0?[1-9]|1[0-2])\b/);
        if (numberMatch) return Number(numberMatch[1]) - 1;

        return null;
    };

    const monthlyConsumptionMap = monthlyConsumption.reduce((acc, item) => {
        const monthIndex = getMonthIndex(item);
        if (monthIndex === null) return acc;
        acc[monthIndex] = Number(item.total || item.value || 0);
        return acc;
    }, {});

    const monthlyConsumptionData =
        monthlyConsumption.length === 1
            ? monthlyConsumption.map((item) => ({
                  name: item.name ?? item.month ?? '—',
                  total: Number(item.total || item.value || 0),
              }))
            : monthOrder.map((name, index) => ({
                  name,
                  total: monthlyConsumptionMap[index] || 0,
              }));

    const tariffTotal = consumptionByTariff.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0,
    );

    const handleFilterChange = (key, value) => {
        router.get(
            route('meter-readings.report'),
            {
                ...filters,
                [key]: value === 'all' ? null : value,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleExport = () => {
        window.location.href = route('meter-readings.export', filters || {});
    };

    const clearFilters = () => {
        router.get(
            route('meter-readings.report'),
            {},
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    const formatAge = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '-';
        const now = new Date();
        const months =
            (now.getFullYear() - date.getFullYear()) * 12 +
            (now.getMonth() - date.getMonth());
        if (months >= 1) {
            return `${months} mo`;
        }
        const days = Math.max(
            0,
            Math.floor((now - date) / (1000 * 60 * 60 * 24)),
        );
        return `${days} d`;
    };

    const hasFilters =
        filters.tariff_id ||
        filters.zone_id ||
        (filters.month && filters.month !== 'all');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Reports" />
            <div className="flex flex-col gap-8 pb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Meter Reading Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Water consumption analytics and reading stats
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 p-1.5 shadow-sm">
                            <div className="flex items-center gap-2 px-2 py-1 text-sm font-bold text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                FILTERS
                            </div>
                            <Select
                                value={filters.month || 'all'}
                                onValueChange={(val) =>
                                    handleFilterChange('month', val)
                                }
                            >
                                <SelectTrigger className="h-9 w-[160px] rounded-lg border-none bg-background shadow-none">
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
                            <Select
                                value={filters.tariff_id?.toString() || 'all'}
                                onValueChange={(val) =>
                                    handleFilterChange('tariff_id', val)
                                }
                            >
                                <SelectTrigger className="h-9 w-[140px] rounded-lg border-none bg-background shadow-none">
                                    <SelectValue placeholder="Tariff" />
                                </SelectTrigger>
                                <SelectContent>
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
                                <SelectTrigger className="h-9 w-[140px] rounded-lg border-none bg-background shadow-none">
                                    <SelectValue placeholder="Zone" />
                                </SelectTrigger>
                                <SelectContent>
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
                        {hasFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-9 gap-2 text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        <Button
                            variant="default"
                            onClick={handleExport}
                            className="h-11 gap-2 shadow-lg shadow-primary/20"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Total Consumption
                            </CardTitle>
                            <div className="rounded-xl bg-primary/10 p-2">
                                <Droplets className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalConsumption.toLocaleString()} m³
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Volume recorded
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Total Readings
                            </CardTitle>
                            <div className="rounded-xl bg-emerald-500/10 p-2">
                                <Hash className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalReadings.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                History across filters
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Avg. Consumption
                            </CardTitle>
                            <div className="rounded-xl bg-amber-500/10 p-2">
                                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(avgConsumption).toFixed(2)} m³
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per reading
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-colors hover:border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Active Tariffs
                            </CardTitle>
                            <div className="rounded-xl bg-violet-500/10 p-2">
                                <Droplets className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tariffs.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tariff plans
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="overflow-hidden border border-border shadow-sm">
                        <CardHeader className="border-b border-border bg-muted/30 pb-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Monthly Consumption Trend
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Meter reading volumes by month
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ChartContainer
                                config={consumptionConfig}
                                className="h-[260px] w-full"
                            >
                                <LineChart data={monthlyConsumptionData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} m³`}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#6366f1"
                                        strokeWidth={2.5}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border border-border shadow-sm">
                        <CardHeader className="border-b border-border bg-muted/30 pb-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Consumption by Zone
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Top zones by total usage
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ChartContainer
                                config={zoneConfig}
                                className="h-[260px] w-full"
                            >
                                <BarChart data={consumptionByZone}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} m³`}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {consumptionByZone.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`zone-cell-${index}`}
                                                    fill={
                                                        [
                                                            '#0ea5e9',
                                                            '#22c55e',
                                                            '#f97316',
                                                            '#e11d48',
                                                            '#8b5cf6',
                                                        ][index % 5]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Breakdowns */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="overflow-hidden border border-border shadow-sm">
                        <CardHeader className="border-b border-border bg-muted/30 pb-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Consumption by Tariff
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Category share of total usage
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {consumptionByTariff.map((item, index) => {
                                    const percent =
                                        tariffTotal > 0
                                            ? Math.round(
                                                  (Number(item.value) /
                                                      tariffTotal) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor: [
                                                            '#38bdf8',
                                                            '#22c55e',
                                                            '#f59e0b',
                                                            '#a855f7',
                                                            '#e11d48',
                                                        ][index % 5],
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600">
                                                {percent}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden border border-border shadow-sm">
                        <CardHeader className="border-b border-border bg-muted/30 pb-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Tariff Split
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Proportion of total consumption
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ChartContainer
                                config={tariffConfig}
                                className="h-[240px] w-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Pie
                                        data={consumptionByTariff.map(
                                            (item) => ({
                                                name: item.name,
                                                value: Number(item.value || 0),
                                            }),
                                        )}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2}
                                    >
                                        {consumptionByTariff.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`tariff-cell-${index}`}
                                                    fill={
                                                        [
                                                            '#38bdf8',
                                                            '#22c55e',
                                                            '#f59e0b',
                                                            '#a855f7',
                                                            '#e11d48',
                                                        ][index % 5]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden border border-border shadow-sm">
                    <CardHeader className="border-b border-border bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Overdue Readings
                                </CardTitle>
                                <p className="text-xs text-slate-500">
                                    Readings older than one month
                                </p>
                            </div>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                                {overdueReadings.length} overdue
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {overdueReadings.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-100">
                                <Table>
                                    <TableHeader className="bg-slate-50/80">
                                        <TableRow>
                                            <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                Customer
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                Meter
                                            </TableHead>
                                            <TableHead className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                Reading Date
                                            </TableHead>
                                            <TableHead className="text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                Age
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overdueReadings.map((reading) => (
                                            <TableRow
                                                key={reading.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell className="text-sm font-medium">
                                                    {reading.customer_name}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {reading.meter_number}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {new Date(
                                                        reading.reading_date,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-semibold text-amber-700">
                                                    {formatAge(
                                                        reading.reading_date,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border bg-muted/30 py-6 text-center text-sm text-muted-foreground">
                                No overdue readings found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="py-8"></div>
        </AppLayout>
    );
}
