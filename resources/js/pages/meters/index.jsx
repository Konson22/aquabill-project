import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, CheckCircle, Edit, Eye, Plus, Search, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import MeterForm from '../forms/meter-form';

const breadcrumbs = [
    {
        title: 'Meters',
        href: '/meters',
    },
];

export default function MetersPage({ meters, customers, types, stats }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMeters, setFilteredMeters] = useState(meters);
    const [filteredStats, setFilteredStats] = useState(stats);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter meters based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMeters(meters);
            setFilteredStats(stats);
        } else {
            const filtered = meters.filter((meter) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in meter number
                const meterNumber = meter.meter_number?.toLowerCase() || '';
                if (meterNumber.includes(searchLower)) return true;

                // Search in customer name
                const customerName = `${meter.customer?.first_name || ''} ${meter.customer?.last_name || ''}`.toLowerCase();
                if (customerName.includes(searchLower)) return true;

                // Search in location
                const location = meter.location?.toLowerCase() || '';
                if (location.includes(searchLower)) return true;

                // Search in status
                const status = meter.status?.toLowerCase() || '';
                if (status.includes(searchLower)) return true;

                return false;
            });

            setFilteredMeters(filtered);

            // Update stats based on filtered results
            const filteredStats = {
                total_meters: filtered.length,
                active_meters: filtered.filter((m) => m.status === 'active').length,
                inactive_meters: filtered.filter((m) => m.status === 'inactive').length,
                faulty_meters: filtered.filter((m) => m.status === 'faulty').length,
                total_consumption: filtered.reduce(
                    (sum, meter) => sum + (meter.readings?.reduce((rSum, reading) => rSum + (reading.consumption || 0), 0) || 0),
                    0,
                ),
            };
            setFilteredStats(filteredStats);
        }
    }, [searchQuery, meters, stats]);

    const formatDate = (date) => {
        if (!date) return 'Not specified';
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
        }).format(number || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'faulty':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4" />;
            case 'inactive':
                return <Users className="h-4 w-4" />;
            case 'faulty':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Zap className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meters Management" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Meters Management</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage and monitor all meters in the system</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Meter
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Meter</DialogTitle>
                            <DialogDescription>Fill in the meter details below to add a new meter to the system.</DialogDescription>
                        </DialogHeader>
                        <MeterForm customers={customers} types={types} closeDialog={() => setDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meters</CardTitle>
                        <Zap className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_meters}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All meters</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Meters</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.active_meters}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Meters</CardTitle>
                        <Users className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.inactive_meters}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Not in use</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faulty Meters</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.faulty_meters}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Need attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Activity className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(filteredStats.total_consumption)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Units consumed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Meters Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle>All Meters</CardTitle>
                            <CardDescription>Manage meter information and assignments</CardDescription>
                        </div>
                        <div className="flex w-full items-center sm:w-80">
                            <Search className="mr-4 text-gray-400" />
                            <Input type="text" placeholder="Search meters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="w-32 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Meter</th>
                                    <th className="w-40 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Customer</th>
                                    <th className="w-32 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Details</th>
                                    <th className="w-24 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Status</th>
                                    <th className="w-32 px-3 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeters.length > 0 ? (
                                    filteredMeters.map((meter) => (
                                        <tr
                                            key={meter.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="flex items-center">
                                                    <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:mr-3 sm:h-8 sm:w-8">
                                                        <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block truncate font-medium">{meter.meter_number}</span>
                                                        <p className="text-xs text-slate-500">{meter.serial && `S/N: ${meter.serial}`}</p>
                                                        {meter.readings && meter.readings.length > 0 && (
                                                            <p className="text-xs text-slate-500">Last: {formatDate(meter.readings[0].date)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                {meter.customer ? (
                                                    <Link href={`/customers/${meter.customer.id}`} className="flex items-center">
                                                        <Users className="mr-1 h-3 w-3 text-slate-400 sm:mr-2 sm:h-4 sm:w-4" />
                                                        <span className="truncate font-medium">
                                                            {meter.customer.first_name} {meter.customer.last_name}
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="space-y-1 text-sm">
                                                    {meter.size && <div className="text-slate-600 dark:text-slate-400">Size: {meter.size}</div>}
                                                    {meter.model && <div className="text-slate-600 dark:text-slate-400">Model: {meter.model}</div>}
                                                    {meter.location && (
                                                        <div className="text-slate-600 dark:text-slate-400">Location: {meter.location}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge className={`${getStatusColor(meter.status)} text-xs`}>
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(meter.status)}
                                                        <span className="capitalize">{meter.status}</span>
                                                    </div>
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1">
                                                    <Link href={`/meters/${meter.id}`}>
                                                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/meters/${meter.id}/edit`}>
                                                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Zap className="mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm">No meters found matching your search.</p>
                                                {searchQuery && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Try adjusting your search terms or clear the search to see all meters.
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
                            Showing {filteredMeters.length} of {meters.length} meters
                            {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
