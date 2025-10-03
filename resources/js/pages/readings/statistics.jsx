import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    Download,
    Droplets,
    Filter,
    Printer,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs = [
    {
        title: 'Readings',
        href: '/readings',
    },
    {
        title: 'Statistics',
        href: '/readings/statistics',
    },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReadingsStatistics({
    statistics,
    monthlyData,
    sourceData,
    consumptionTrends,
    topCustomers,
    recentReadings,
    categories,
    neighborhoods,
    filters,
    categoryConsumption,
}) {
    // Filter state
    const [filterState, setFilterState] = useState({
        month: filters?.month || 'all',
        year: filters?.year || new Date().getFullYear().toString(),
        category: filters?.category || 'all',
        neighborhood: filters?.neighborhood || 'all',
    });

    // Generate year options (last 5 years)
    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year.toString(), label: year.toString() };
    });

    // Generate month options
    const monthOptions = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();

        if (filterState.month && filterState.month !== 'all') params.append('month', filterState.month);
        if (filterState.year) params.append('year', filterState.year);
        if (filterState.category && filterState.category !== 'all') params.append('category', filterState.category);
        if (filterState.neighborhood && filterState.neighborhood !== 'all') params.append('neighborhood', filterState.neighborhood);

        router.get('/readings/statistics', Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilterState({
            month: 'all',
            year: new Date().getFullYear().toString(),
            category: 'all',
            neighborhood: 'all',
        });
        router.get(
            '/readings/statistics',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const formatCurrency = (amount) => {
        return `SSP ${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Export statistics to Excel
    const exportStatistics = () => {
        const lines = [];

        // Header
        lines.push('METER READINGS STATISTICS REPORT');
        lines.push('');
        lines.push(`Report Date: ${new Date().toLocaleString()}`);
        lines.push('');

        // Overall Statistics
        lines.push('OVERALL STATISTICS');
        lines.push(`Total Readings: ${statistics.total_readings}`);
        lines.push(`This Month: ${statistics.this_month}`);
        lines.push(`Total Consumption: ${formatNumber(statistics.total_consumption)} units`);
        lines.push(`Average Consumption: ${formatNumber(statistics.avg_consumption)} units`);
        lines.push(`Highest Consumption: ${formatNumber(statistics.highest_consumption)} units`);
        lines.push(`Lowest Consumption: ${formatNumber(statistics.lowest_consumption)} units`);
        lines.push('');

        // Monthly Data
        lines.push('MONTHLY BREAKDOWN');
        lines.push('Month,Readings,Consumption,Average');
        monthlyData.forEach((month) => {
            lines.push(`${month.month},${month.readings},${formatNumber(month.consumption)},${formatNumber(month.average)}`);
        });
        lines.push('');

        // Source Data
        lines.push('SOURCE BREAKDOWN');
        lines.push('Source,Readings,Percentage');
        sourceData.forEach((source) => {
            lines.push(`${source.name},${source.value},${source.percentage}%`);
        });
        lines.push('');

        // Category Consumption Data
        lines.push('CONSUMPTION BY CUSTOMER CATEGORY');
        lines.push('Category,Readings,Total Consumption,Average Consumption,Percentage of Total');
        categoryConsumption?.forEach((category) => {
            lines.push(
                `${category.category_name},${category.readings_count},${formatNumber(category.total_consumption)},${formatNumber(category.average_consumption)},${category.percentage_of_total}%`,
            );
        });
        lines.push('');

        // Create and download file
        const BOM = '\uFEFF';
        const content = BOM + lines.join('\n');
        const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `readings_statistics_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Print statistics
    const printStatistics = () => {
        const printWindow = window.open('', '_blank');

        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Meter Readings Statistics</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; color: #2c3e50; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>METER READINGS STATISTICS REPORT</h1>
        <div>Report Date: ${new Date().toLocaleString()}</div>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${statistics.total_readings}</div>
            <div class="stat-label">Total Readings</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${statistics.this_month}</div>
            <div class="stat-label">This Month</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatNumber(statistics.total_consumption)}</div>
            <div class="stat-label">Total Consumption</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatNumber(statistics.avg_consumption)}</div>
            <div class="stat-label">Average Consumption</div>
        </div>
    </div>
    
    <h3>Monthly Breakdown</h3>
    <table>
        <thead>
            <tr><th>Month</th><th>Readings</th><th>Consumption</th><th>Average</th></tr>
        </thead>
        <tbody>
            ${monthlyData
                .map(
                    (month) => `
                <tr>
                    <td>${month.month}</td>
                    <td>${month.readings}</td>
                    <td>${formatNumber(month.consumption)}</td>
                    <td>${formatNumber(month.average)}</td>
                </tr>
            `,
                )
                .join('')}
        </tbody>
    </table>
    
    <h3>Source Breakdown</h3>
    <table>
        <thead>
            <tr><th>Source</th><th>Readings</th><th>Percentage</th></tr>
        </thead>
        <tbody>
            ${sourceData
                .map(
                    (source) => `
                <tr>
                    <td>${source.name}</td>
                    <td>${source.value}</td>
                    <td>${source.percentage}%</td>
                </tr>
            `,
                )
                .join('')}
        </tbody>
    </table>
    
    <h3>Consumption by Customer Category</h3>
    <table>
        <thead>
            <tr><th>Category</th><th>Readings</th><th>Total Consumption</th><th>Average Consumption</th><th>Percentage of Total</th></tr>
        </thead>
        <tbody>
            ${
                categoryConsumption
                    ?.map(
                        (category) => `
                <tr>
                    <td>${category.category_name}</td>
                    <td>${category.readings_count}</td>
                    <td>${formatNumber(category.total_consumption)}</td>
                    <td>${formatNumber(category.average_consumption)}</td>
                    <td>${category.percentage_of_total}%</td>
                </tr>
            `,
                    )
                    .join('') || '<tr><td colspan="5">No category data available</td></tr>'
            }
        </tbody>
    </table>
</body>
</html>`;

        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Readings Statistics" />

            {/* Modern Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/5"></div>
                <div className="relative">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-white/20 p-3">
                                    <BarChart3 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold">Readings Analytics</h1>
                                    <p className="text-indigo-100">Comprehensive insights and data visualization for meter readings</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="text-sm font-medium">{statistics.total_readings} Total Readings</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                                    <Droplets className="h-4 w-4" />
                                    <span className="text-sm font-medium">{formatNumber(statistics.total_consumption)} Units</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-sm font-medium">{formatNumber(statistics.avg_consumption)} Avg/Reading</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="secondary"
                                onClick={exportStatistics}
                                className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={printStatistics}
                                className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </Button>
                            <Button variant="secondary" onClick={applyFilters} className="border-white/30 bg-white/20 text-white hover:bg-white/30">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Filters */}
            <Card className="mb-8 border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                                    <Filter className="h-5 w-5 text-white" />
                                </div>
                                Advanced Filters
                                {(filterState.month !== 'all' || filterState.category !== 'all' || filterState.neighborhood !== 'all') && (
                                    <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                        {
                                            [filterState.month !== 'all', filterState.category !== 'all', filterState.neighborhood !== 'all'].filter(
                                                Boolean,
                                            ).length
                                        }{' '}
                                        Active
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">
                                Refine your analytics with precise filtering options
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={applyFilters}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Filter className="h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Month Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Time Period</label>
                            <Select value={filterState.month} onValueChange={(value) => setFilterState((prev) => ({ ...prev, month: value }))}>
                                <SelectTrigger className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                                    <SelectValue placeholder="All months" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All months</SelectItem>
                                    {monthOptions.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Year</label>
                            <Select value={filterState.year} onValueChange={(value) => setFilterState((prev) => ({ ...prev, year: value }))}>
                                <SelectTrigger className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map((year) => (
                                        <SelectItem key={year.value} value={year.value}>
                                            {year.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Customer Category</label>
                            <Select value={filterState.category} onValueChange={(value) => setFilterState((prev) => ({ ...prev, category: value }))}>
                                <SelectTrigger className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Neighborhood Filter */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Neighborhood</label>
                            <Select
                                value={filterState.neighborhood}
                                onValueChange={(value) => setFilterState((prev) => ({ ...prev, neighborhood: value }))}
                            >
                                <SelectTrigger className="border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                                    <SelectValue placeholder="All neighborhoods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All neighborhoods</SelectItem>
                                    {neighborhoods?.map((neighborhood) => (
                                        <SelectItem key={neighborhood.id} value={neighborhood.id.toString()}>
                                            {neighborhood.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(filterState.month !== 'all' || filterState.category !== 'all' || filterState.neighborhood !== 'all') && (
                        <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-900/20 dark:to-purple-900/20">
                            <div className="mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Active Filters:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filterState.month !== 'all' && (
                                    <Badge
                                        variant="outline"
                                        className="border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                    >
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {monthOptions.find((m) => m.value === filterState.month)?.label}
                                    </Badge>
                                )}
                                {filterState.category !== 'all' && (
                                    <Badge
                                        variant="outline"
                                        className="border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-200"
                                    >
                                        <Users className="mr-1 h-3 w-3" />
                                        {categories?.find((c) => c.id.toString() === filterState.category)?.name}
                                    </Badge>
                                )}
                                {filterState.neighborhood !== 'all' && (
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200"
                                    >
                                        <Target className="mr-1 h-3 w-3" />
                                        {neighborhoods?.find((n) => n.id.toString() === filterState.neighborhood)?.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Enhanced KPI Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Readings Card */}
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Readings</CardTitle>
                        <div className="rounded-lg bg-blue-500 p-2">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{statistics.total_readings}</div>
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">All time readings</p>
                        <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            <span>Comprehensive data</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Consumption Card */}
                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg dark:from-green-900/20 dark:to-green-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Consumption</CardTitle>
                        <div className="rounded-lg bg-green-500 p-2">
                            <Droplets className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">{formatNumber(statistics.total_consumption)}</div>
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">Cubic meters</p>
                        <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            <span>Water usage</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Average Consumption Card */}
                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Average Consumption</CardTitle>
                        <div className="rounded-lg bg-purple-500 p-2">
                            <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{formatNumber(statistics.avg_consumption)}</div>
                        <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">Per reading</p>
                        <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                            <Target className="mr-1 h-3 w-3" />
                            <span>Efficiency metric</span>
                        </div>
                    </CardContent>
                </Card>

                {/* This Month Card */}
                <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg dark:from-orange-900/20 dark:to-orange-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">This Month</CardTitle>
                        <div className="rounded-lg bg-orange-500 p-2">
                            <Calendar className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{statistics.this_month || 0}</div>
                        <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">Current month</p>
                        <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                            <Zap className="mr-1 h-3 w-3" />
                            <span>Recent activity</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Statistics Row */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Highest Consumption Card */}
                <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 shadow-lg dark:from-red-900/20 dark:to-red-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Peak Consumption</CardTitle>
                        <div className="rounded-lg bg-red-500 p-2">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-900 dark:text-red-100">{formatNumber(statistics.highest_consumption)}</div>
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">Single reading peak</p>
                        <div className="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            <span>Maximum recorded</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Lowest Consumption Card */}
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg dark:from-indigo-900/20 dark:to-indigo-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Minimum Consumption</CardTitle>
                        <div className="rounded-lg bg-indigo-500 p-2">
                            <Target className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{formatNumber(statistics.lowest_consumption)}</div>
                        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Single reading minimum</p>
                        <div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                            <span>Minimum recorded</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Monthly Consumption Trend */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-2">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Monthly Consumption Trend</CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Water consumption patterns over the last 12 months
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        formatter={(value) => [formatNumber(value), 'Consumption (m³)']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#consumptionGradient)"
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Readings Count */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Monthly Readings Count</CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Number of meter readings recorded each month
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="readingsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Bar dataKey="readings" fill="url(#readingsGradient)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Consumption Trends - Full Width */}
                <Card className="border-0 shadow-lg lg:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Consumption Analysis</CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Average vs total consumption trends over time
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionTrends}>
                                    <defs>
                                        <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        formatter={(value, name) => [formatNumber(value), name === 'average' ? 'Average (m³)' : 'Total (m³)']}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="average"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fill="url(#averageGradient)"
                                        name="Average"
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#ec4899"
                                        strokeWidth={3}
                                        fill="url(#totalGradient)"
                                        name="Total"
                                        dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Top Customers */}
            <div className="mt-8">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 p-2">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                    Top Customers by Consumption
                                </CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-400">
                                    Customers with highest total water consumption
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <div
                                    key={customer.id}
                                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-amber-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-amber-600"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${
                                                        index === 0
                                                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                            : index === 1
                                                              ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                                              : index === 2
                                                                ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                                                                : 'bg-gradient-to-r from-slate-400 to-slate-500'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
                                                        <span className="text-xs font-bold text-white">★</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-lg font-semibold text-slate-900 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400">
                                                    {customer.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="font-medium">Account:</span>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                                    >
                                                        {customer.account_number}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                {formatNumber(customer.total_consumption)}
                                                <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">m³</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <Activity className="h-4 w-4" />
                                                <span>{customer.readings_count} readings</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress bar for visual ranking */}
                                    <div className="mt-4">
                                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                            <span>Consumption Level</span>
                                            <span>{Math.round((customer.total_consumption / (topCustomers[0]?.total_consumption || 1)) * 100)}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    index === 0
                                                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                                        : index === 1
                                                          ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                                          : index === 2
                                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                                                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min((customer.total_consumption / (topCustomers[0]?.total_consumption || 1)) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
