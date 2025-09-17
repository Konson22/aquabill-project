import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Activity, Building2, Calendar, ChevronDown, CreditCard, Download, Edit, FileText, Mail, User, UserCheck, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'User Management',
        href: '/users',
    },
    {
        title: 'User Profile',
        href: '#',
    },
];

const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusIcons = {
    active: UserCheck,
    inactive: X,
};

export default function UserProfile({ user, stats }) {
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        status: user.status || '',
        department_id: user.department_id || '',
    });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        patch(route('users.update', user.id), {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const StatusIcon = statusIcons[user.status] || User;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - User Profile`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
                            <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <User className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                    {user.name}
                                    <Badge className={statusColors[user.status]}>
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {user.status?.toUpperCase()}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="mt-1">{user.department?.name || 'No Department Assigned'}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </div>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Building2 className="h-4 w-4" />
                                    Department
                                </div>
                                <p className="font-medium">{user.department?.name || 'Not assigned'}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    Member Since
                                </div>
                                <p className="font-medium">{formatDate(user.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Activity className="h-4 w-4" />
                                    Last Updated
                                </div>
                                <p className="font-medium">{formatDate(user.updated_at)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Meter Readings</CardTitle>
                            <Activity className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_readings}</div>
                            <p className="text-muted-foreground text-xs">{stats.recent_activity_count} in last 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bills Generated</CardTitle>
                            <FileText className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_bills_generated}</div>
                            <p className="text-muted-foreground text-xs">Total bills created</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payments Received</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_payments_received}</div>
                            <p className="text-muted-foreground text-xs">Total payments processed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Form Modal */}
                {isEditing && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit User Profile</CardTitle>
                            <CardDescription>Update user information and role assignments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Export Button */}
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export Data
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}/export-readings`} className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Export Readings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/users/${user.id}/export-bills`} className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Export Bills
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Activity Tabs */}
                <Tabs defaultValue="readings" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="readings">Meter Readings</TabsTrigger>
                        <TabsTrigger value="bills">Generated Bills</TabsTrigger>
                        <TabsTrigger value="payments">Received Payments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="readings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Meter Readings</CardTitle>
                                <CardDescription>Latest meter readings recorded by this user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {user.meter_readings && user.meter_readings.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.meter_readings.map((reading) => (
                                            <div key={reading.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {reading.meter?.customer?.first_name} {reading.meter?.customer?.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Meter: {reading.meter?.meter_number}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{reading.value} M³</p>
                                                    <p className="text-sm text-gray-600">{formatDate(reading.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">No meter readings found</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bills" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Generated Bills</CardTitle>
                                <CardDescription>Bills generated by this user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {user.generated_bills && user.generated_bills.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.generated_bills.map((bill) => (
                                            <div key={bill.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="font-medium">Bill #{bill.id}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {bill.customer?.first_name} {bill.customer?.last_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">SSP {bill.total_amount?.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(bill.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">No bills generated</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Received Payments</CardTitle>
                                <CardDescription>Payments received by this user</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {user.received_payments && user.received_payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.received_payments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="font-medium">Payment #{payment.id}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {payment.customer?.first_name} {payment.customer?.last_name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">SSP {payment.amount?.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600">{formatDate(payment.payment_date)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">No payments received</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
