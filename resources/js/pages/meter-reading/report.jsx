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
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, Droplets, Hash, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

export default function MeterReadingReport({
    monthlyConsumption,
    readingsByTariff,
    consumptionByTariff,
    consumptionByZone,
    totalReadings,
    totalConsumption,
    avgConsumption,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Reading Reports" />
            <div className="flex flex-col gap-6 p-4 md:p-0">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('meter-readings')}
                            className="rounded-full border bg-white p-2 shadow-sm transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-700" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Meter Reading Reports
                            </h1>
                            <p className="text-muted-foreground">
                                Water consumption analytics and reading stats
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={filters.tariff_id?.toString() || 'all'}
                                onValueChange={(val) =>
                                    handleFilterChange('tariff_id', val)
                                }
                            >
                                <SelectTrigger className="h-10 w-[160px] bg-white">
                                    <SelectValue placeholder="All Tariffs" />
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
                                <SelectTrigger className="h-10 w-[160px] bg-white">
                                    <SelectValue placeholder="All Zones" />
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

                        <div className="hidden h-5 w-px bg-border sm:block" />

                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="h-10 gap-2 bg-white"
                        >
                            <Download className="h-4 w-4 text-emerald-600" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Consumption
                            </CardTitle>
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalConsumption.toLocaleString()} m³
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All time volume recorded
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Readings
                            </CardTitle>
                            <Hash className="h-4 w-4 text-muted-foreground" />
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg. Consumption
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(avgConsumption).toFixed(2)} m³
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Average per reading
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="flex w-full">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Monthly Consumption Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={consumptionConfig}
                                className="h-[250px] w-full"
                            >
                                <BarChart data={monthlyConsumption}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
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
                                        tickFormatter={(value) => `${value} m³`}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--color-total)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Consumption by Zone */}
                    <Card className="ml-4 w-[40%]">
                        <CardHeader>
                            <CardTitle>Consumption by Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={zoneConfig}
                                className="h-[250px] w-full"
                            >
                                <BarChart data={consumptionByZone}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
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
                                        tickFormatter={(value) => `${value} m³`}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {consumptionByZone.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`var(--color-${entry.name})`}
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
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consumption by Tariff</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tariff</TableHead>
                                        <TableHead className="text-right">
                                            Consumption (m³)
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumptionByTariff.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {Number(
                                                    item.value,
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
                            <CardTitle>Consumption by Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Zone</TableHead>
                                        <TableHead className="text-right">
                                            Consumption (m³)
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consumptionByZone.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">
                                                {item.name}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {Number(
                                                    item.value,
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
