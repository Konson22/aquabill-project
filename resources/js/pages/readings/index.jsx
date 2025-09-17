import AddReadingModal from '@/components/readings/add-reading-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, BarChart3, Download, Droplets, Filter, Printer, Search, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Readings',
        href: '/readings',
    },
];

export default function ReadingsPage({ readings, stats, meters, customers }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredReadings, setFilteredReadings] = useState(readings);
    const [filteredStats, setFilteredStats] = useState(stats);

    // Filter states
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        month: '',
        year: '',
        source: '',
        illegalConnection: '',
        consumptionMin: '',
        consumptionMax: '',
        status: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Filter readings based on search query and filters
    useEffect(() => {
        let filtered = readings;

        // Apply search filter
        if (searchQuery.trim() !== '') {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter((reading) => {
                // Search in customer name
                const customerName = `${reading.meter?.customer?.first_name || ''} ${reading.meter?.customer?.last_name || ''}`.toLowerCase();
                if (customerName.includes(searchLower)) return true;

                // Search in meter serial
                const meterSerial = reading.meter?.serial?.toString().toLowerCase() || '';
                if (meterSerial.includes(searchLower)) return true;

                // Search in reading date
                const readingDate = new Date(reading.date).toLocaleDateString().toLowerCase();
                if (readingDate.includes(searchLower)) return true;

                // Search in reading values
                const currentReading = reading.value?.toString().toLowerCase() || '';
                const previousReading = reading.previous?.toString().toLowerCase() || '';
                const consumption = reading.consumption?.toString().toLowerCase() || '';

                if (currentReading.includes(searchLower) || previousReading.includes(searchLower) || consumption.includes(searchLower)) return true;

                // Search in source
                const source = (reading.source || 'manual').toLowerCase();
                if (source.includes(searchLower)) return true;

                // Search in recorded by name or billing officer
                const recordedBy = reading.recorded_by?.name?.toLowerCase() || '';
                const billingOfficer = reading.billing_officer?.toLowerCase() || '';
                if (recordedBy.includes(searchLower) || billingOfficer.includes(searchLower)) return true;

                // Search in bill IDs
                if (reading.bills && reading.bills.length > 0) {
                    const billIds = reading.bills.map((bill) => bill.id.toString()).join(' ');
                    if (billIds.includes(searchLower)) return true;
                }

                return false;
            });
        }

        // Apply date range filter
        if (filters.dateFrom) {
            filtered = filtered.filter((reading) => {
                const readingDate = new Date(reading.date);
                const fromDate = new Date(filters.dateFrom);
                return readingDate >= fromDate;
            });
        }

        if (filters.dateTo) {
            filtered = filtered.filter((reading) => {
                const readingDate = new Date(reading.date);
                const toDate = new Date(filters.dateTo);
                return readingDate <= toDate;
            });
        }

        // Apply month filter
        if (filters.month) {
            filtered = filtered.filter((reading) => {
                const readingDate = new Date(reading.date);
                return readingDate.getMonth() === parseInt(filters.month) - 1; // Month is 0-indexed
            });
        }

        // Apply year filter
        if (filters.year) {
            filtered = filtered.filter((reading) => {
                const readingDate = new Date(reading.date);
                return readingDate.getFullYear() === parseInt(filters.year);
            });
        }

        // Apply source filter
        if (filters.source) {
            filtered = filtered.filter((reading) => {
                const source = reading.source || 'manual';
                return source === filters.source;
            });
        }

        // Apply illegal connection filter
        if (filters.illegalConnection !== '') {
            filtered = filtered.filter((reading) => {
                const isIllegal = reading.illigal_connection === 1 || reading.illigal_connection === true;
                return filters.illegalConnection === 'yes' ? isIllegal : !isIllegal;
            });
        }

        // Apply consumption range filter
        if (filters.consumptionMin) {
            filtered = filtered.filter((reading) => {
                const consumption = reading.consumption || 0;
                return consumption >= parseFloat(filters.consumptionMin);
            });
        }

        if (filters.consumptionMax) {
            filtered = filtered.filter((reading) => {
                const consumption = reading.consumption || 0;
                return consumption <= parseFloat(filters.consumptionMax);
            });
        }

        // Apply status filter (billed/unbilled)
        if (filters.status) {
            filtered = filtered.filter((reading) => {
                const hasBills = reading.bills && reading.bills.length > 0;
                return filters.status === 'billed' ? hasBills : !hasBills;
            });
        }

        setFilteredReadings(filtered);

        // Update stats based on filtered results
        const filteredStats = {
            total_readings: filtered.length,
            this_month: filtered.filter((r) => {
                const readingDate = new Date(r.date);
                const now = new Date();
                return readingDate.getMonth() === now.getMonth() && readingDate.getFullYear() === now.getFullYear();
            }).length,
            total_consumption: filtered.reduce((sum, r) => sum + (r.consumption || 0), 0),
            avg_consumption: filtered.length > 0 ? filtered.reduce((sum, r) => sum + (r.consumption || 0), 0) / filtered.length : 0,
        };
        setFilteredStats(filteredStats);
    }, [searchQuery, filters, readings, stats]);

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

    // Get unique sources from readings
    const getUniqueSources = () => {
        const sources = readings.map((reading) => reading.source || 'manual');
        return [...new Set(sources)].map((source) => ({
            id: source,
            name: source.charAt(0).toUpperCase() + source.slice(1),
        }));
    };

    // Get available years from readings
    const getAvailableYears = () => {
        const years = readings.map((reading) => new Date(reading.date).getFullYear());
        return [...new Set(years)]
            .sort((a, b) => b - a)
            .map((year) => ({
                id: year.toString(),
                name: year.toString(),
            }));
    };

    // Get month name from month number
    const getMonthName = (monthNumber) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[parseInt(monthNumber) - 1] || monthNumber;
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            month: '',
            year: '',
            source: '',
            illegalConnection: '',
            consumptionMin: '',
            consumptionMax: '',
            status: '',
        });
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some((value) => value !== '');

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
                const activeFilters = Object.entries(filters)
                    .filter(([key, value]) => value !== '')
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                if (activeFilters) {
                    lines.push(`Active Filters: ${activeFilters}`);
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
                     Active Filters: ${Object.entries(filters)
                         .filter(([key, value]) => value !== '')
                         .map(([key, value]) => `${key}: ${value}`)
                         .join(', ')}
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

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Meter Readings</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage and view all meter readings across the system</p>
                </div>
                <div className="flex items-center">
                    <Button variant="outline" asChild>
                        <Link href="/readings/statistics">
                            <BarChart3 className="h-4 w-4" />
                            Statistics
                        </Link>
                    </Button>
                    <AddReadingModal meters={meters} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_readings}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All time readings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(filteredStats.total_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total units consumed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Consumption</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(filteredStats.avg_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Average per reading</p>
                    </CardContent>
                </Card>
            </div>

            {/* Readings Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Readings</CardTitle>
                            <CardDescription>Latest meter readings from all customers</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-80">
                                <Input
                                    type="text"
                                    placeholder="Search by customer, meter, or date..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                                        {Object.values(filters).filter((value) => value !== '').length}
                                    </Badge>
                                )}
                            </Button>
                            <Button variant="default" onClick={exportToExcel} className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export Excel
                            </Button>
                            <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                Print Report
                            </Button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Filter Readings</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Showing {filteredReadings.length} of {readings.length} readings
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
                                    {filters.dateFrom && (
                                        <Badge variant="secondary" className="text-xs">
                                            From: {filters.dateFrom}
                                        </Badge>
                                    )}
                                    {filters.dateTo && (
                                        <Badge variant="secondary" className="text-xs">
                                            To: {filters.dateTo}
                                        </Badge>
                                    )}
                                    {filters.month && (
                                        <Badge variant="secondary" className="text-xs">
                                            Month: {getMonthName(filters.month)}
                                        </Badge>
                                    )}
                                    {filters.year && (
                                        <Badge variant="secondary" className="text-xs">
                                            Year: {filters.year}
                                        </Badge>
                                    )}
                                    {filters.source && (
                                        <Badge variant="secondary" className="text-xs">
                                            Source: {filters.source}
                                        </Badge>
                                    )}
                                    {filters.illegalConnection && (
                                        <Badge variant="secondary" className="text-xs">
                                            Illegal: {filters.illegalConnection === 'yes' ? 'Yes' : 'No'}
                                        </Badge>
                                    )}
                                    {filters.status && (
                                        <Badge variant="secondary" className="text-xs">
                                            Status: {filters.status}
                                        </Badge>
                                    )}
                                    {(filters.consumptionMin || filters.consumptionMax) && (
                                        <Badge variant="secondary" className="text-xs">
                                            Consumption: {filters.consumptionMin || '0'} - {filters.consumptionMax || '∞'}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">From Date</label>
                                    <Input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">To Date</label>
                                    <Input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} />
                                </div>

                                {/* Month Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Month</label>
                                    <Select
                                        value={filters.month}
                                        onChange={(e) => handleFilterChange('month', e.target.value)}
                                        options={[
                                            { id: '1', name: 'January' },
                                            { id: '2', name: 'February' },
                                            { id: '3', name: 'March' },
                                            { id: '4', name: 'April' },
                                            { id: '5', name: 'May' },
                                            { id: '6', name: 'June' },
                                            { id: '7', name: 'July' },
                                            { id: '8', name: 'August' },
                                            { id: '9', name: 'September' },
                                            { id: '10', name: 'October' },
                                            { id: '11', name: 'November' },
                                            { id: '12', name: 'December' },
                                        ]}
                                        placeholder="Select month"
                                    />
                                </div>

                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Year</label>
                                    <Select
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        options={getAvailableYears()}
                                        placeholder="Select year"
                                    />
                                </div>

                                {/* Source Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Source</label>
                                    <Select
                                        value={filters.source}
                                        onChange={(e) => handleFilterChange('source', e.target.value)}
                                        options={getUniqueSources()}
                                        placeholder="Select source"
                                    />
                                </div>

                                {/* Illegal Connection Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Illegal Connection</label>
                                    <Select
                                        value={filters.illegalConnection}
                                        onChange={(e) => handleFilterChange('illegalConnection', e.target.value)}
                                        options={[
                                            { id: 'yes', name: 'Yes' },
                                            { id: 'no', name: 'No' },
                                        ]}
                                        placeholder="All connections"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                                    <Select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        options={[
                                            { id: 'billed', name: 'Billed' },
                                            { id: 'unbilled', name: 'Unbilled' },
                                        ]}
                                        placeholder="All status"
                                    />
                                </div>
                            </div>

                            {/* Second row of filters */}
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* Consumption Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Min Consumption</label>
                                    <Input
                                        type="number"
                                        value={filters.consumptionMin}
                                        onChange={(e) => handleFilterChange('consumptionMin', e.target.value)}
                                        placeholder="Min units"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Max Consumption</label>
                                    <Input
                                        type="number"
                                        value={filters.consumptionMax}
                                        onChange={(e) => handleFilterChange('consumptionMax', e.target.value)}
                                        placeholder="Max units"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Quick Date Filters */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Quick Filters</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date();
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateFrom: today.toISOString().split('T')[0],
                                                    dateTo: today.toISOString().split('T')[0],
                                                }));
                                            }}
                                            className="text-xs"
                                        >
                                            Today
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const today = new Date();
                                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateFrom: firstDay.toISOString().split('T')[0],
                                                    dateTo: today.toISOString().split('T')[0],
                                                }));
                                            }}
                                            className="text-xs"
                                        >
                                            This Month
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Actions</label>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                                            Clear All
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setShowFilters(false)} className="text-xs">
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Receipt No</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Previous</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Current</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Consumption</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReadings.length > 0 ? (
                                    filteredReadings.map((reading) => (
                                        <tr
                                            key={reading.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-3">
                                                <Link href={`/customers/${reading.meter?.customer?.id}`}>
                                                    <div className="font-medium">
                                                        {reading.meter?.customer?.first_name} {reading.meter?.customer?.last_name}
                                                    </div>
                                                    <Badge variant="outline">{reading.meter?.serial}</Badge>
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {reading.bills && reading.bills.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {reading.bills.map((bill) => (
                                                            <Link
                                                                key={bill.id}
                                                                href={`/billing/${bill.id}`}
                                                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                #{bill.id}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400 dark:text-slate-500">No bill</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(reading.date)}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatNumber(reading.previous)}</td>
                                            <td className="px-4 py-3 font-medium">{formatNumber(reading.value)}</td>
                                            <td className="px-4 py-3">
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {formatNumber(reading.consumption)}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    {/* Illegal Connection Badge */}
                                                    {(reading.illigal_connection === 1 || reading.illigal_connection === true) && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Illegal Connection
                                                        </Badge>
                                                    )}

                                                    {/* Billing Status Badge */}
                                                    {reading.bills && reading.bills.length > 0 ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
                                                        >
                                                            Billed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            Unbilled
                                                        </Badge>
                                                    )}
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

                    {/* Results Count */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Showing {filteredReadings.length} of {readings.length} results
                            {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
