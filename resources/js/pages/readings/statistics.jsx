import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Calendar, Download, Droplets, Filter, Printer, Zap } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Readings Statistics</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Comprehensive analytics and insights for meter readings</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportStatistics} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={printStatistics} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                        {(filterState.month !== 'all' || filterState.category !== 'all' || filterState.neighborhood !== 'all') && (
                            <Badge variant="secondary" className="ml-2">
                                Active
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>Filter statistics by month, year, customer category, and neighborhood</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Month Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Month</label>
                            <Select value={filterState.month} onValueChange={(value) => setFilterState((prev) => ({ ...prev, month: value }))}>
                                <SelectTrigger>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Year</label>
                            <Select value={filterState.year} onValueChange={(value) => setFilterState((prev) => ({ ...prev, year: value }))}>
                                <SelectTrigger>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Category</label>
                            <Select value={filterState.category} onValueChange={(value) => setFilterState((prev) => ({ ...prev, category: value }))}>
                                <SelectTrigger>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Neighborhood</label>
                            <Select
                                value={filterState.neighborhood}
                                onValueChange={(value) => setFilterState((prev) => ({ ...prev, neighborhood: value }))}
                            >
                                <SelectTrigger>
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
                        <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                            <div className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">Active Filters:</div>
                            <div className="flex flex-wrap gap-2">
                                {filterState.month !== 'all' && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                        Month: {monthOptions.find((m) => m.value === filterState.month)?.label}
                                    </Badge>
                                )}
                                {filterState.category !== 'all' && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                        Category: {categories?.find((c) => c.id.toString() === filterState.category)?.name}
                                    </Badge>
                                )}
                                {filterState.neighborhood !== 'all' && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                        Neighborhood: {neighborhoods?.find((n) => n.id.toString() === filterState.neighborhood)?.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filter Actions */}
                    <div className="mt-4 flex gap-2">
                        <Button onClick={applyFilters} className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
                        <Calendar className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statistics.total_readings}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All time readings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(statistics.total_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total units consumed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Statistics */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Consumption</CardTitle>
                        <Zap className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(statistics.highest_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Single reading peak</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lowest Consumption</CardTitle>
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(statistics.lowest_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Single reading minimum</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Monthly Consumption Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Consumption Trend</CardTitle>
                        <CardDescription>Consumption patterns over the last 12 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [formatNumber(value), 'Consumption']} />
                                    <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Source Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reading Sources Distribution</CardTitle>
                        <CardDescription>Breakdown of readings by data source</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Readings Count */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Readings Count</CardTitle>
                        <CardDescription>Number of readings recorded each month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="readings" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Consumption Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consumption Trends</CardTitle>
                        <CardDescription>Average consumption vs total consumption</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [formatNumber(value), 'Units']} />
                                    <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} name="Average" />
                                    <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} name="Total" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers */}
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers by Consumption</CardTitle>
                        <CardDescription>Customers with highest total consumption</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <div key={customer.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="flex h-8 w-8 items-center justify-center rounded-full">
                                            {index + 1}
                                        </Badge>
                                        <div>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-slate-500">Account: {customer.account_number}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatNumber(customer.total_consumption)} units</div>
                                        <div className="text-sm text-slate-500">{customer.readings_count} readings</div>
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
