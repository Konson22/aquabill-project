import AddReadingModal from '@/components/readings/add-reading-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Activity, BarChart3, Calendar, Download, Droplets, Printer, Search, Trash2, TrendingUp, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Readings',
        href: '/readings',
    },
];

export default function ReadingsPage({ readings, stats, meters, customers, auth, filters = {}, categories = [], neighborhoods = [] }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [neighborhoodFilter, setNeighborhoodFilter] = useState(filters.neighborhood || 'all');
    const [yearFilter, setYearFilter] = useState(filters.year || 'all');
    const [monthFilter, setMonthFilter] = useState(filters.month || 'all');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, readingId: null, readingInfo: null });

    const { delete: deleteReading, processing: deleting } = useForm();

    // Delete reading function
    const handleDeleteReading = (readingId, readingInfo) => {
        setDeleteDialog({
            open: true,
            readingId,
            readingInfo,
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.readingId) {
            deleteReading(route('readings.destroy', deleteDialog.readingId), {
                onSuccess: () => {
                    setDeleteDialog({ open: false, readingId: null, readingInfo: null });
                },
            });
        }
    };

    const cancelDelete = () => {
        setDeleteDialog({ open: false, readingId: null, readingInfo: null });
    };

    const readingItems = useMemo(() => {
        if (!readings || !readings.data) return [];
        return readings.data;
    }, [readings]);

    const filteredReadings = useMemo(() => {
        let list = readingItems;
        if (searchQuery.trim() !== '') {
            const s = searchQuery.toLowerCase();
            list = list.filter((r) => {
                const name = `${r.meter?.customer?.first_name || ''} ${r.meter?.customer?.last_name || ''}`.toLowerCase();
                const acct = (r.meter?.customer?.account_number || '').toString().toLowerCase();
                const serial = (r.meter?.serial || '').toLowerCase();
                return name.includes(s) || acct.includes(s) || serial.includes(s);
            });
        }
        if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter((r) => {
                return r.meter?.customer?.category?.id?.toString() === categoryFilter;
            });
        }
        if (neighborhoodFilter && neighborhoodFilter !== 'all') {
            list = list.filter((r) => {
                return r.meter?.customer?.neighborhood?.id?.toString() === neighborhoodFilter;
            });
        }
        if (yearFilter && yearFilter !== 'all') {
            list = list.filter((r) => {
                const readingDate = new Date(r.date);
                return readingDate.getFullYear().toString() === yearFilter;
            });
        }
        if (monthFilter && monthFilter !== 'all') {
            list = list.filter((r) => {
                const readingDate = new Date(r.date);
                return (readingDate.getMonth() + 1).toString() === monthFilter;
            });
        }
        return list;
    }, [readingItems, searchQuery, categoryFilter, neighborhoodFilter, yearFilter, monthFilter]);

    const filteredStats = useMemo(() => {
        const total_readings = filteredReadings.length;
        const this_month = filteredReadings.filter((r) => {
            const readingDate = new Date(r.date);
            const now = new Date();
            return readingDate.getMonth() === now.getMonth() && readingDate.getFullYear() === now.getFullYear();
        }).length;
        const total_consumption = filteredReadings.reduce((sum, r) => sum + (r.consumption || 0), 0);
        const avg_consumption =
            filteredReadings.length > 0 ? filteredReadings.reduce((sum, r) => sum + (r.consumption || 0), 0) / filteredReadings.length : 0;

        return {
            total_readings,
            this_month,
            total_consumption,
            avg_consumption,
        };
    }, [filteredReadings]);

    // Sync filters to server (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = {
                search: searchQuery || undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                neighborhood: neighborhoodFilter !== 'all' ? neighborhoodFilter : undefined,
                year: yearFilter !== 'all' ? yearFilter : undefined,
                month: monthFilter !== 'all' ? monthFilter : undefined,
            };
            router.get('/readings', params, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(handle);
    }, [searchQuery, categoryFilter, neighborhoodFilter, yearFilter, monthFilter]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setNeighborhoodFilter('all');
        setYearFilter('all');
        setMonthFilter('all');
    };

    // Check if any filters are active
    const hasActiveFilters =
        searchQuery ||
        (categoryFilter && categoryFilter !== 'all') ||
        (neighborhoodFilter && neighborhoodFilter !== 'all') ||
        (yearFilter && yearFilter !== 'all') ||
        (monthFilter && monthFilter !== 'all');

    // Export to Excel functionality
    const exportToExcel = () => {
        // Create a more comprehensive Excel-like format
        const createExcelContent = () => {
            const lines = [];

            // Add title and metadata
            lines.push('METER READINGS EXPORT REPORT');
            lines.push('');
            lines.push(`Export Date: ${new Date().toLocaleString()}`);
            lines.push(`Total Records: ${filteredReadings.length}`);
            if (hasActiveFilters) {
                lines.push('Filtered Data: Yes');
                const activeFilters = [];
                if (searchQuery) activeFilters.push(`Search: ${searchQuery}`);
                if (categoryFilter && categoryFilter !== 'all') {
                    const category = categories.find((c) => c.id.toString() === categoryFilter);
                    activeFilters.push(`Category: ${category?.name || categoryFilter}`);
                }
                if (neighborhoodFilter && neighborhoodFilter !== 'all') {
                    const neighborhood = neighborhoods.find((n) => n.id.toString() === neighborhoodFilter);
                    activeFilters.push(`Neighborhood: ${neighborhood?.name || neighborhoodFilter}`);
                }
                if (yearFilter && yearFilter !== 'all') activeFilters.push(`Year: ${yearFilter}`);
                if (monthFilter && monthFilter !== 'all') activeFilters.push(`Month: ${monthFilter}`);
                if (activeFilters.length > 0) {
                    lines.push(`Active Filters: ${activeFilters.join(', ')}`);
                }
            } else {
                lines.push('Filtered Data: No (All Records)');
            }
            lines.push('');

            // Add column headers with proper spacing
            const headers = [
                'Reading ID',
                'Customer Name',
                'Account Number',
                'Meter Serial',
                'Bill IDs',
                'Reading Date',
                'Previous Reading',
                'Current Reading',
                'Consumption (Units)',
                'Source',
                'Billing Officer',
                'Created At',
            ];

            // Create header row with proper formatting
            lines.push(headers.map((header) => `"${header}"`).join(','));

            // Add data rows
            filteredReadings.forEach((reading) => {
                const row = [
                    reading.id,
                    `${reading.meter?.customer?.first_name || ''} ${reading.meter?.customer?.last_name || ''}`.trim() || 'N/A',
                    reading.meter?.customer?.account_number || 'N/A',
                    reading.meter?.serial || 'N/A',
                    reading.bills && reading.bills.length > 0 ? reading.bills.map((bill) => `#${bill.id}`).join(', ') : 'No bill',
                    formatDate(reading.date),
                    formatNumber(reading.previous),
                    formatNumber(reading.value),
                    formatNumber(reading.consumption),
                    (reading.source || 'manual').charAt(0).toUpperCase() + (reading.source || 'manual').slice(1),
                    reading.recorded_by?.name || 'N/A',
                    new Date(reading.created_at).toLocaleString(),
                ];

                // Escape quotes and wrap in quotes for proper CSV formatting
                const escapedRow = row.map((cell) => {
                    const cellStr = String(cell || '');
                    // Escape quotes by doubling them
                    const escaped = cellStr.replace(/"/g, '""');
                    return `"${escaped}"`;
                });

                lines.push(escapedRow.join(','));
            });

            // Add summary statistics at the end
            lines.push('');
            lines.push('SUMMARY STATISTICS');
            lines.push(`Total Readings: ${filteredReadings.length}`);

            if (filteredReadings.length > 0) {
                const totalConsumption = filteredReadings.reduce((sum, r) => sum + (r.consumption || 0), 0);
                const avgConsumption = totalConsumption / filteredReadings.length;
                const sources = [...new Set(filteredReadings.map((r) => r.source || 'manual'))];

                lines.push(`Total Consumption: ${formatNumber(totalConsumption)} units`);
                lines.push(`Average Consumption: ${formatNumber(avgConsumption)} units`);
                lines.push(`Sources: ${sources.join(', ')}`);

                // Date range
                const dates = filteredReadings.map((r) => new Date(r.date)).sort();
                if (dates.length > 0) {
                    lines.push(`Date Range: ${formatDate(dates[0])} to ${formatDate(dates[dates.length - 1])}`);
                }
            }

            return lines.join('\n');
        };

        // Create the Excel content
        const excelContent = createExcelContent();

        // Add BOM for Excel UTF-8 support
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + excelContent], {
            type: 'application/vnd.ms-excel;charset=utf-8;',
        });

        // Create download link
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Generate filename with current date and filter info
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filterInfo = hasActiveFilters ? '_filtered' : '';
        const filename = `Meter_Readings_Report_${dateStr}_${timeStr}${filterInfo}.xls`;

        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Print functionality
    const printReport = () => {
        const printWindow = window.open('', '_blank');

        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Meter Readings Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #2c3e50;
        }
        .metadata {
            margin: 10px 0;
            font-size: 14px;
            color: #666;
        }
        .filters {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .summary h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .summary-item {
            margin: 5px 0;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>METER READINGS EXPORT REPORT</h1>
        <div class="metadata">
            <div>Export Date: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredReadings.length}</div>
            ${
                hasActiveFilters
                    ? `<div>Filtered Data: Yes</div>
                 <div class="filters">
                     Active Filters: ${(() => {
                         const activeFilters = [];
                         if (searchQuery) activeFilters.push(`Search: ${searchQuery}`);
                         if (categoryFilter) {
                             const category = categories.find((c) => c.id.toString() === categoryFilter);
                             activeFilters.push(`Category: ${category?.name || categoryFilter}`);
                         }
                         if (neighborhoodFilter) {
                             const neighborhood = neighborhoods.find((n) => n.id.toString() === neighborhoodFilter);
                             activeFilters.push(`Neighborhood: ${neighborhood?.name || neighborhoodFilter}`);
                         }
                         if (yearFilter) activeFilters.push(`Year: ${yearFilter}`);
                         if (monthFilter) activeFilters.push(`Month: ${monthFilter}`);
                         return activeFilters.join(', ');
                     })()}
                 </div>`
                    : '<div>Filtered Data: No (All Records)</div>'
            }
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Reading ID</th>
                <th>Customer Name</th>
                <th>Account Number</th>
                <th>Meter Serial</th>
                <th>Receipt No</th>
                <th>Reading Date</th>
                <th>Previous Reading</th>
                <th>Current Reading</th>
                <th>Consumption (Units)</th>
                <th>Source</th>
                <th>Billing Officer</th>
                <th>Recorded By</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${filteredReadings
                .map(
                    (reading) => `
                <tr>
                    <td>${reading.id}</td>
                    <td>${`${reading.meter?.customer?.first_name || ''} ${reading.meter?.customer?.last_name || ''}`.trim() || 'N/A'}</td>
                    <td>${reading.meter?.customer?.account_number || 'N/A'}</td>
                    <td>${reading.meter?.serial || 'N/A'}</td>
                    <td>${reading.bills && reading.bills.length > 0 ? reading.bills.map((bill) => `#${bill.id}`).join(', ') : 'No bill'}</td>
                    <td>${formatDate(reading.date)}</td>
                    <td>${formatNumber(reading.previous)}</td>
                    <td>${formatNumber(reading.value)}</td>
                    <td>${formatNumber(reading.consumption)}</td>
                    <td>${(reading.source || 'manual').charAt(0).toUpperCase() + (reading.source || 'manual').slice(1)}</td>
                    <td>${reading.billing_officer || 'N/A'}</td>
                    <td>${reading.recorded_by?.name || 'N/A'}</td>
                    <td>${new Date(reading.created_at).toLocaleString()}</td>
                </tr>
            `,
                )
                .join('')}
        </tbody>
    </table>

    <div class="summary">
        <h3>SUMMARY STATISTICS</h3>
        <div class="summary-item">Total Readings: ${filteredReadings.length}</div>
        ${
            filteredReadings.length > 0
                ? `
            <div class="summary-item">Total Consumption: ${formatNumber(filteredReadings.reduce((sum, r) => sum + (r.consumption || 0), 0))} units</div>
            <div class="summary-item">Average Consumption: ${formatNumber(filteredReadings.reduce((sum, r) => sum + (r.consumption || 0), 0) / filteredReadings.length)} units</div>
            <div class="summary-item">Sources: ${[...new Set(filteredReadings.map((r) => r.source || 'manual'))].join(', ')}</div>
            ${(() => {
                const dates = filteredReadings.map((r) => new Date(r.date)).sort();
                return dates.length > 0
                    ? `<div class="summary-item">Date Range: ${formatDate(dates[0])} to ${formatDate(dates[dates.length - 1])}</div>`
                    : '';
            })()}
        `
                : ''
        }
    </div>
</body>
</html>`;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Readings" />

            {/* Modern Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
                <div className="relative">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Meter Readings</h1>
                            <p className="text-slate-600 dark:text-slate-400">Track and manage water consumption data across the system</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <AddReadingModal meters={meters} />
                            <Button variant="outline" asChild>
                                <Link href="/readings/statistics">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Analytics
                                </Link>
                            </Button>
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-1">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Readings</CardTitle>
                        <div className="rounded-lg bg-blue-500 p-1.5">
                            <Activity className="h-3.5 w-3.5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pt-1 pb-4">
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{filteredStats.total_readings}</div>
                        <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">All time readings</p>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-1">
                        <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Consumption</CardTitle>
                        <div className="rounded-lg bg-purple-500 p-1.5">
                            <Droplets className="h-3.5 w-3.5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pt-1 pb-4">
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatNumber(filteredStats.total_consumption)}</div>
                        <p className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">Cubic meters</p>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg dark:from-orange-900/20 dark:to-orange-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-1">
                        <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Consumption</CardTitle>
                        <div className="rounded-lg bg-orange-500 p-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pt-1 pb-4">
                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{formatNumber(filteredStats.avg_consumption)}</div>
                        <p className="mt-0.5 text-xs text-orange-600 dark:text-orange-400">Per reading</p>
                    </CardContent>
                </Card>
            </div>

            {/* Modern Search and Filter Section */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-white dark:bg-slate-800">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Readings</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Latest meter readings from all customers</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[300px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by customer, meter, or date..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="default" onClick={exportToExcel} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button
                                variant="outline"
                                onClick={printReport}
                                className="flex items-center gap-2 border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="mt-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Filter Readings</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing {filteredReadings.length} of {readingItems.length} readings
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="mr-1 h-3 w-3" />
                                Clear All
                            </Button>
                        </div>

                        {/* Active Filters Summary */}
                        {hasActiveFilters && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {searchQuery && (
                                    <Badge variant="secondary" className="text-xs">
                                        Search: {searchQuery}
                                    </Badge>
                                )}
                                {categoryFilter && categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-xs">
                                        Category: {categories.find((c) => c.id.toString() === categoryFilter)?.name || categoryFilter}
                                    </Badge>
                                )}
                                {neighborhoodFilter && neighborhoodFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-xs">
                                        Neighborhood: {neighborhoods.find((n) => n.id.toString() === neighborhoodFilter)?.name || neighborhoodFilter}
                                    </Badge>
                                )}
                                {yearFilter && yearFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-xs">
                                        Year: {yearFilter}
                                    </Badge>
                                )}
                                {monthFilter && monthFilter !== 'all' && (
                                    <Badge variant="secondary" className="text-xs">
                                        Month: {monthFilter}
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Category Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Neighborhood Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Neighborhood</label>
                                <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All neighborhoods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All neighborhoods</SelectItem>
                                        {neighborhoods.map((neighborhood) => (
                                            <SelectItem key={neighborhood.id} value={neighborhood.id.toString()}>
                                                {neighborhood.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Year Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Year</label>
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All years</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                        <SelectItem value="2027">2027</SelectItem>
                                        <SelectItem value="2028">2028</SelectItem>
                                        <SelectItem value="2029">2029</SelectItem>
                                        <SelectItem value="2030">2030</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Month Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Month</label>
                                <Select value={monthFilter} onValueChange={setMonthFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All months" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All months</SelectItem>
                                        <SelectItem value="1">January</SelectItem>
                                        <SelectItem value="2">February</SelectItem>
                                        <SelectItem value="3">March</SelectItem>
                                        <SelectItem value="4">April</SelectItem>
                                        <SelectItem value="5">May</SelectItem>
                                        <SelectItem value="6">June</SelectItem>
                                        <SelectItem value="7">July</SelectItem>
                                        <SelectItem value="8">August</SelectItem>
                                        <SelectItem value="9">September</SelectItem>
                                        <SelectItem value="10">October</SelectItem>
                                        <SelectItem value="11">November</SelectItem>
                                        <SelectItem value="12">December</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                                Clear All Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Receipt No</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Previous</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Current</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Consumption</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredReadings.length > 0 ? (
                                        filteredReadings.map((reading) => (
                                            <tr
                                                key={reading.id}
                                                className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-6 py-4">
                                                    <Link href={`/customers/${reading.meter?.customer?.id}`} className="group">
                                                        <div className="font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                                                            {reading.meter?.customer?.first_name} {reading.meter?.customer?.last_name}
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="mt-1 border-blue-200 bg-blue-50 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                                        >
                                                            {reading.meter?.serial}
                                                        </Badge>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {reading.bills && reading.bills.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {reading.bills.map((bill) => (
                                                                <Link
                                                                    key={bill.id}
                                                                    href={`/billing/${bill.id}`}
                                                                    className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    #{bill.id}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400 italic dark:text-slate-500">No bill</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <Calendar className="h-4 w-4" />
                                                        <span className="text-sm">{formatDate(reading.date)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-sm text-slate-600 dark:text-slate-400">
                                                        {formatNumber(reading.previous)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                        {formatNumber(reading.value)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4 text-orange-500" />
                                                        <Badge className="border-orange-200 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:border-orange-800 dark:from-orange-900/20 dark:to-orange-800/20 dark:text-orange-300">
                                                            {formatNumber(reading.consumption)} m³
                                                        </Badge>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <Link href={`/readings/${reading.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/readings/${reading.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        {auth?.user?.is_admin && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDeleteReading(reading.id, {
                                                                        customer: `${reading.meter?.customer?.first_name} ${reading.meter?.customer?.last_name}`,
                                                                        serial: reading.meter?.serial,
                                                                        date: reading.date,
                                                                    })
                                                                }
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                                                <div className="flex flex-col items-center">
                                                    <Search className="mb-2 h-8 w-8 text-slate-300" />
                                                    <p className="text-sm">No readings found matching your search.</p>
                                                    {searchQuery && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Try adjusting your search terms or clear the search to see all readings.
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {filteredReadings.length} of {readingItems.length} results
                            {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {deleteDialog.open && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-slate-800">
                        <div className="mb-4 flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Delete Reading</h3>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Are you sure you want to delete this reading? This action cannot be undone.
                            </p>
                            {deleteDialog.readingInfo && (
                                <div className="mt-2 rounded-md bg-slate-50 p-3 dark:bg-slate-700">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Customer: {deleteDialog.readingInfo.customer}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Meter: {deleteDialog.readingInfo.serial}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Date: {new Date(deleteDialog.readingInfo.date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={cancelDelete} disabled={deleting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
