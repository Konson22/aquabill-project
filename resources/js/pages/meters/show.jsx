import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, Calendar, CheckCircle, Edit, MapPin, Users, Zap } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Meters',
        href: '/meters',
    },
    {
        title: 'Details',
        href: '#',
    },
];

export default function MeterShow({ meter }) {
    const formatDate = (date) => {
        if (!date) return 'Not specified';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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
            <Head title={`Meter #${meter.meter_number} - Details`} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            <Zap className="h-8 w-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Meter #{meter.meter_number}</h1>
                            <div className="mt-2 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                <Badge className={getStatusColor(meter.status)}>
                                    <div className="flex items-center space-x-1">
                                        {getStatusIcon(meter.status)}
                                        <span className="capitalize">{meter.status}</span>
                                    </div>
                                </Badge>
                                {meter.customer && (
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Assigned to: {meter.customer.first_name} {meter.customer.last_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Link href={`/meters/${meter.id}/edit`}>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Meter
                            </Button>
                        </Link>
                        <Link href="/meters">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Back to Meters
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meter.readings?.length || 0}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All time readings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Zap className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(meter.readings?.reduce((sum, reading) => sum + ((reading.value || 0) - (reading.previous || 0)), 0))}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Units consumed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Consumption</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {meter.readings && meter.readings.length > 0
                                ? formatNumber(
                                      meter.readings.reduce((sum, reading) => sum + ((reading.value || 0) - (reading.previous || 0)), 0) /
                                          meter.readings.length,
                                  )
                                : '0.00'}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Per reading</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Reading</CardTitle>
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {meter.readings && meter.readings.length > 0 ? formatNumber(meter.readings[0].value) : '0.00'}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            {meter.readings && meter.readings.length > 0 ? formatDate(meter.readings[0].date) : 'No readings'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Meter Information */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Zap className="mr-2 h-5 w-5" />
                                Meter Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Meter Number</label>
                                    <p className="text-sm font-medium">#{meter.meter_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                    <Badge className={getStatusColor(meter.status)}>
                                        <div className="flex items-center space-x-1">
                                            {getStatusIcon(meter.status)}
                                            <span className="capitalize">{meter.status}</span>
                                        </div>
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</label>
                                <p className="flex items-center text-sm">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {meter.location || 'Not specified'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Installation Date</label>
                                <p className="flex items-center text-sm">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formatDate(meter.installation_date)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {meter.customer ? (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer Name</label>
                                        <p className="text-sm font-medium">
                                            {meter.customer.first_name} {meter.customer.last_name}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                            <p className="text-sm">{meter.customer.phone || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                                            <p className="text-sm">{meter.customer.email || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</label>
                                        <p className="text-sm">{meter.customer.address}</p>
                                        {meter.customer.house_no && <p className="text-sm text-slate-500">House: {meter.customer.house_no}</p>}
                                    </div>

                                    {meter.customer.area && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Area</label>
                                            <p className="text-sm">{meter.customer.area.name}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-8 text-center">
                                    <Users className="mx-auto h-12 w-12 text-slate-300" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">No customer assigned</h3>
                                    <p className="mt-1 text-sm text-slate-500">This meter is not assigned to any customer.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Readings History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="mr-2 h-5 w-5" />
                            Reading History
                        </CardTitle>
                        <CardDescription>All meter readings recorded for this meter</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {meter.readings && meter.readings.length > 0 ? (
                            <div className="space-y-4">
                                {meter.readings.map((reading) => (
                                    <div key={reading.id} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <Activity className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{formatDate(reading.date)}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Recorded by: {reading.recorded_by?.name || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatNumber(reading.value)} units</p>
                                            <p className="text-xs text-slate-500">
                                                Consumption: {formatNumber((reading.value || 0) - (reading.previous || 0))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Activity className="mx-auto h-12 w-12 text-slate-300" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">No readings found</h3>
                                <p className="mt-1 text-sm text-slate-500">No meter readings have been recorded for this meter yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
