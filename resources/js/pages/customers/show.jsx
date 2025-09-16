import SimpleMeterReadingForm from '@/components/forms/simple-meter-reading-form';
import MeterAssignmentModal from '@/components/meter-assignment-modal';
import InvoicePaymentFormModal from '@/components/payments/InvoicePaymentFormModal';
import PaymentFormModal from '@/components/payments/PaymentFormModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    CreditCard,
    Download,
    Droplets,
    Edit,
    Eye,
    FileText,
    Mail,
    MapPin,
    MoreHorizontal,
    Phone,
    Plus,
    Receipt,
    Settings,
    Smartphone,
    Tag,
    Trash2,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
    {
        title: 'Profile',
        href: '#',
    },
];

export default function Show({ customer, customers = [], availableMeters = [], metersForReadings = [] }) {
    const { patch, processing } = useForm();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentDefaults, setPaymentDefaults] = useState({});
    const [invoicePaymentModalOpen, setInvoicePaymentModalOpen] = useState(false);
    const [invoicePaymentDefaults, setInvoicePaymentDefaults] = useState({});

    // Debug: Log customer data to see if invoices are loaded
    console.log('Customer data:', customer);
    console.log('Customer invoices:', customer.invoices);

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

    const getStatusColor = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const toggleStatus = (checked) => {
        console.log('Toggling status to:', checked);
        patch(
            `/customers/${customer.id}`,
            {
                _method: 'PUT',
                is_active: checked,
            },
            {
                onSuccess: () => {
                    console.log('Status updated successfully');
                },
                onError: (errors) => {
                    console.error('Error updating status:', errors);
                },
            },
        );
    };

    const handleDelete = () => {
        router.delete(`/customers/${customer.id}`, {
            onSuccess: () => {
                // Redirect to customers index after successful deletion
                router.visit('/customers');
            },
            onError: (errors) => {
                console.error('Error deleting customer:', errors);
                setShowDeleteDialog(false);
            },
        });
    };

    const openPaymentModal = (invoice) => {
        setPaymentDefaults({
            customer_id: customer.id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            amount: invoice.amount_due || '',
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
        });
        setPaymentModalOpen(true);
    };

    const openInvoicePaymentModal = (invoice) => {
        setInvoicePaymentDefaults({
            invoice_id: invoice.id,
            customer_id: customer.id,
            customer_name: `${customer.first_name} ${customer.last_name}`,
            amount: invoice.amount_due || '',
            due_date: invoice.due_date || '',
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
        });
        setInvoicePaymentModalOpen(true);
    };

    const submitPayment = (data) => {
        const payload = {
            customer_id: data.customer_id,
            payment_date: data.date,
            amount_paid: data.amount,
            payment_method: data.method,
            reference_number: data.reference_number || 'N/A', // Fix field name mismatch
        };

        return new Promise((resolve) => {
            router.post('/payments', payload, {
                onSuccess: () => {
                    setPaymentModalOpen(false);
                    resolve();
                },
                onError: (errors) => {
                    console.error('Payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };

    const submitInvoicePayment = (data) => {
        const payload = {
            invoice_id: data.invoice_id,
            customer_id: data.customer_id,
            payment_date: data.date,
            amount_paid: data.amount,
            payment_method: data.method,
            reference_number: data.reference_number || 'N/A', // Fix field name mismatch
        };

        return new Promise((resolve) => {
            router.post('/payments/invoice', payload, {
                onSuccess: () => {
                    setInvoicePaymentModalOpen(false);
                    resolve();
                },
                onError: (errors) => {
                    console.error('Invoice payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${customer.first_name} ${customer.last_name} - Customer Profile`} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl text-white">
                            👤
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                {customer.first_name} {customer.last_name}
                            </h1>
                            <div className="mt-2 flex items-center space-x-4">
                                <Badge className={getStatusColor(customer.is_active)}>{customer.is_active ? 'Active' : 'Inactive'}</Badge>
                                {customer.account_number && (
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Account: #{customer.account_number}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/customers/${customer.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                        <a href={`/customers/${customer.id}/export`}>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </Button>
                        </a>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                        <MeterAssignmentModal
                            customer={customer}
                            availableMeters={availableMeters}
                            trigger={
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Manage Meters
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Meter</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.meter ? `#${customer.meter.serial || customer.meter.id}` : 'Not assigned'}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Primary meter</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                        <Receipt className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.bills?.length || 0}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Generated bills</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(customer.readings?.reduce((sum, reading) => sum + (reading.consumption || 0), 0) || 0)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total m³ consumed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credit Limit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${formatNumber(customer.credit)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Available credit</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content with Tabs */}
            <div className="space-y-6">
                {/* Overview Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                                        <p className="text-sm">
                                            {customer.first_name} {customer.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Number</label>
                                        <p className="text-sm">{customer.account_number || 'Not assigned'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                                        <p className="flex items-center text-sm">
                                            <Phone className="mr-1 h-3 w-3" />
                                            {customer.phone || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                                        <p className="flex items-center text-sm">
                                            <Mail className="mr-1 h-3 w-3" />
                                            {customer.email || 'Not provided'}
                                        </p>
                                    </div>
                                </div>

                                {customer.location && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</label>
                                        <p className="flex items-center text-sm">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            {customer.location.name}
                                            {customer.location.description && (
                                                <span className="ml-2 text-slate-500">({customer.location.description})</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {customer.category && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</label>
                                        <p className="text-sm">
                                            <Tag className="mr-1 h-3 w-3" />
                                            {customer.category.name}
                                            {customer.category.description && (
                                                <span className="ml-2 text-slate-500">({customer.category.description})</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contract Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Receipt className="mr-2 h-5 w-5" />
                                    Contract Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract Number</label>
                                        <p className="text-sm">{customer.contract || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract Date</label>
                                        <p className="text-sm">{formatDate(customer.date)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Credit Limit</label>
                                    <p className="text-2xl font-bold text-green-600">${formatNumber(customer.credit)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                    <div className="flex items-center gap-3">
                                        <Badge className={getStatusColor(customer.is_active)}>
                                            {customer.is_active ? 'Active Customer' : 'Inactive Customer'}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={customer.is_active} onCheckedChange={toggleStatus} disabled={processing} />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {processing ? 'Updating...' : customer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Customer Details
                        </CardTitle>
                        <CardDescription>View location, meter, readings and bills</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="meters" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="meters" className="flex items-center space-x-2">
                                    <Droplets className="h-4 w-4" />
                                    <span>Meter & Log</span>
                                </TabsTrigger>
                                <TabsTrigger value="readings" className="flex items-center space-x-2">
                                    <Activity className="h-4 w-4" />
                                    <span>Readings</span>
                                </TabsTrigger>
                                <TabsTrigger value="bills" className="flex items-center space-x-2">
                                    <Receipt className="h-4 w-4" />
                                    <span>Bills</span>
                                </TabsTrigger>
                                <TabsTrigger value="invoices" className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Invoices</span>
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="flex items-center space-x-2">
                                    <Receipt className="h-4 w-4" />
                                    <span>Payments</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Meters & Log Tab */}
                            <TabsContent value="meters" className="mt-6 space-y-6">
                                {/* Current Meter Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Meter</h3>
                                        <MeterAssignmentModal
                                            customer={customer}
                                            availableMeters={availableMeters}
                                            trigger={
                                                <Button variant="outline" size="sm">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Manage Meter
                                                </Button>
                                            }
                                        />
                                    </div>

                                    {customer.meter ? (
                                        <div className="rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">Meter #{customer.meter.serial || customer.meter.id}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {customer.meter.type?.name || 'No type'} • {customer.meter.status || 'No status'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{customer.meter.readings?.length || 0} readings</p>
                                                    <p className="text-xs text-slate-500">
                                                        Last:{' '}
                                                        {customer.meter.readings?.[0] ? formatDate(customer.meter.readings[0].date) : 'No readings'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center dark:border-slate-600">
                                            <Droplets className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No meter assigned</h3>
                                            <p className="mt-2 text-sm text-slate-500">This customer doesn't have a meter assigned yet.</p>
                                            <div className="mt-4">
                                                <MeterAssignmentModal
                                                    customer={customer}
                                                    availableMeters={availableMeters}
                                                    trigger={
                                                        <Button>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Assign First Meter
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Meter Change History Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Meter Change History</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {customer.meter_logs?.length || 0} change(s) recorded
                                        </p>
                                    </div>

                                    {customer.meter_logs && customer.meter_logs.length > 0 ? (
                                        <Card>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-slate-700">
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Settings className="h-4 w-4" />
                                                                    <span>Action</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Droplets className="h-4 w-4" />
                                                                    <span>Previous Meter</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Droplets className="h-4 w-4" />
                                                                    <span>New Meter</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    <span>Reason</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Users className="h-4 w-4" />
                                                                    <span>Performed By</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>Date</span>
                                                                </div>
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customer.meter_logs
                                                            ?.slice()
                                                            .reverse()
                                                            .map((log) => {
                                                                const getActionBadge = (actionType) => {
                                                                    const badges = {
                                                                        initial_assignment:
                                                                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                                                                        meter_replacement:
                                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                                                                        meter_removal: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                                                                        meter_reactivation:
                                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                                                                    };
                                                                    return (
                                                                        badges[actionType] ||
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                                                                    );
                                                                };

                                                                const getActionLabel = (actionType) => {
                                                                    const labels = {
                                                                        initial_assignment: 'Initial Assignment',
                                                                        meter_replacement: 'Meter Replacement',
                                                                        meter_removal: 'Meter Removal',
                                                                        meter_reactivation: 'Meter Reactivation',
                                                                    };
                                                                    return labels[actionType] || actionType;
                                                                };

                                                                return (
                                                                    <TableRow
                                                                        key={log.id}
                                                                        className="border-gray-100 transition-colors hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-slate-700/50"
                                                                    >
                                                                        <TableCell className="px-6 py-4">
                                                                            <Badge className={getActionBadge(log.action_type)}>
                                                                                {getActionLabel(log.action_type)}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {log.old_meter ? (
                                                                                    <div>
                                                                                        <div className="font-medium">
                                                                                            #{log.old_meter.serial || log.old_meter.id}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {log.old_meter.model || 'No model'} •{' '}
                                                                                            {log.old_meter.status || 'No status'}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-gray-400">None</span>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {log.new_meter ? (
                                                                                    <div>
                                                                                        <div className="font-medium">
                                                                                            #{log.new_meter.serial || log.new_meter.id}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {log.new_meter.model || 'No model'} •{' '}
                                                                                            {log.new_meter.status || 'No status'}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-gray-400">None</span>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <div className="font-medium">
                                                                                    {log.reason || 'No reason provided'}
                                                                                </div>
                                                                                {log.notes && (
                                                                                    <div className="mt-1 text-xs text-gray-500">{log.notes}</div>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {log.performed_by ? (
                                                                                    <div>
                                                                                        <div className="font-medium">
                                                                                            {log.performed_by.name || 'Unknown User'}
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {log.performed_by.email || ''}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-gray-400">System</span>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {formatDate(log.effective_date)}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center dark:border-slate-600">
                                            <Settings className="mx-auto h-12 w-12 text-slate-300" />
                                            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No meter changes recorded</h3>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                This customer hasn't had any meter changes yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Readings Tab */}
                            <TabsContent value="readings" className="mt-6 space-y-4">
                                {customer.readings && customer.readings.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Meter Readings</h3>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/customers/${customer.id}/export-readings`}
                                                    className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                                </a>
                                            </div>

                                            {/* Add Reading Modal */}
                                            {customer.meter ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Reading
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Add New Reading</DialogTitle>
                                                            <DialogDescription>
                                                                Add a new meter reading for {customer.first_name} {customer.last_name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="mt-4">
                                                            <SimpleMeterReadingForm
                                                                meter={customer.meter}
                                                                onSubmit={() => {
                                                                    // Refresh the page to show new reading
                                                                    window.location.reload();
                                                                }}
                                                                errors={{}}
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <MeterAssignmentModal
                                                    customer={customer}
                                                    availableMeters={availableMeters}
                                                    trigger={
                                                        <Button variant="outline" size="sm">
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Assign Meter First
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>

                                        <Card>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-slate-700">
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Droplets className="h-4 w-4" />
                                                                    <span>Meter</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Activity className="h-4 w-4" />
                                                                    <span>Previous Reading</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Activity className="h-4 w-4" />
                                                                    <span>Current Reading</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <TrendingUp className="h-4 w-4" />
                                                                    <span>Consumption (m³)</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                                <div className="flex items-center space-x-2">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>Reading Date</span>
                                                                </div>
                                                            </TableHead>
                                                            <TableHead className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                                                                Actions
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {/* Customer readings */}
                                                        {customer.readings
                                                            ?.slice()
                                                            .reverse()
                                                            .map((reading, index) => {
                                                                // Get the previous reading (next in chronological order)
                                                                const prevReading =
                                                                    index < customer.readings.length - 1
                                                                        ? customer.readings[customer.readings.length - 2 - index]
                                                                        : null;

                                                                // Calculate consumption: current reading - previous reading
                                                                const consumption = prevReading
                                                                    ? parseFloat(reading.value) - parseFloat(prevReading.value)
                                                                    : 0;

                                                                return (
                                                                    <TableRow
                                                                        key={reading.id}
                                                                        className="border-gray-100 transition-colors hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-slate-700/50"
                                                                    >
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="flex items-center space-x-3">
                                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                                                    <Droplets className="h-4 w-4" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                                        Meter #{reading.meter?.serial || reading.meter_id}
                                                                                    </div>
                                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                                        {reading.meter?.type?.name || 'No type'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {prevReading ? formatNumber(prevReading.value) : 'N/A'}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                                                {formatNumber(reading.value)}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                                                {formatNumber(consumption)} m³
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4">
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                                                {formatDate(reading.date)}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="px-6 py-4 text-right">
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-48">
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link
                                                                                            href={`/readings/${reading.id}`}
                                                                                            className="flex items-center"
                                                                                        >
                                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                                            View Details
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem asChild>
                                                                                        <Link
                                                                                            href={`/readings/${reading.id}/edit`}
                                                                                            className="flex items-center"
                                                                                        >
                                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                                            Edit Reading
                                                                                        </Link>
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                        Delete Reading
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Activity className="mx-auto h-12 w-12 text-slate-300" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900">No readings found</h3>
                                        <p className="mt-1 text-sm text-slate-500">No meter readings have been recorded yet.</p>
                                        <div className="mt-4">
                                            {customer.meter ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add First Reading
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Add First Reading</DialogTitle>
                                                            <DialogDescription>
                                                                Add the first meter reading for {customer.first_name} {customer.last_name}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="mt-4">
                                                            <SimpleMeterReadingForm
                                                                meter={customer.meter}
                                                                onSubmit={() => {
                                                                    window.location.reload();
                                                                }}
                                                                errors={{}}
                                                            />
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <MeterAssignmentModal
                                                    customer={customer}
                                                    availableMeters={availableMeters}
                                                    trigger={
                                                        <Button>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Assign Meter First
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Invoices Tab */}
                            <TabsContent value="invoices" className="mt-6 space-y-4">
                                <div className="space-y-6">
                                    {/* Invoices Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Service Invoices</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {customer.invoices?.length || 0} invoice(s) found
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Invoice
                                                </Button>
                                            </div>
                                        </div>

                                        {customer.invoices && customer.invoices.length > 0 ? (
                                            <div className="space-y-4">
                                                {customer.invoices.map((invoice) => (
                                                    <div
                                                        key={invoice.id}
                                                        className="rounded-lg border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start space-x-4">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                                                    <FileText className="h-6 w-6" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="mb-2 flex items-center gap-2">
                                                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                                            Invoice #{invoice.id}
                                                                        </h4>
                                                                        <Badge
                                                                            className={
                                                                                invoice.status === 'paid'
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                                    : invoice.status === 'pending'
                                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                            }
                                                                        >
                                                                            {invoice.status?.toUpperCase()}
                                                                        </Badge>
                                                                    </div>

                                                                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                                                                        {invoice.reason || 'Service Invoice'}
                                                                    </p>

                                                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                                                        <div>
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                                Issue Date:
                                                                            </span>
                                                                            <p className="text-slate-600 dark:text-slate-400">
                                                                                {formatDate(invoice.issue_date)}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                                Due Date:
                                                                            </span>
                                                                            <p className="text-slate-600 dark:text-slate-400">
                                                                                {formatDate(invoice.due_date)}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                                Amount Due:
                                                                            </span>
                                                                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                                                SSP {formatNumber(invoice.amount_due)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                {invoice.status !== 'paid' && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => openInvoicePaymentModal(invoice)}
                                                                    >
                                                                        <Receipt className="h-4 w-4" />
                                                                        Pay
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center">
                                                <FileText className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
                                                <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No invoices found</h3>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    This customer doesn't have any service invoices yet.
                                                </p>
                                                <div className="mt-6">
                                                    <Button variant="outline" size="sm">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add First Invoice
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Bills Tab */}
                            <TabsContent value="bills" className="mt-6 space-y-4">
                                <div className="space-y-6">
                                    {/* Bills Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customer Bills</h3>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/customers/${customer.id}/export-bills`}
                                                    className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
                                                >
                                                    <Download className="mr-2 h-4 w-4" /> Export CSV
                                                </a>
                                            </div>
                                        </div>

                                        {customer.bills && customer.bills.length > 0 ? (
                                            <div className="space-y-4">
                                                {customer.bills.map((bill) => (
                                                    <div key={bill.id} className="flex items-center justify-between rounded-lg border p-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                                                <Receipt className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">Bill #{bill.bill_number}</h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {formatDate(bill.bill_date)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">${formatNumber(bill.total_amount)}</p>
                                                            <Badge
                                                                className={
                                                                    bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {bill.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Receipt className="mx-auto h-12 w-12 text-slate-300" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No bills found</h3>
                                                <p className="mt-1 text-sm text-slate-500">No bills have been generated for this customer yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Invoices Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customer Invoices</h3>
                                        {customer.invoices && customer.invoices.length > 0 ? (
                                            <div className="space-y-4">
                                                {customer.invoices.map((invoice) => (
                                                    <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                                <Receipt className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">Invoice #{invoice.invoice_number}</h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {formatDate(invoice.invoice_date)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">${formatNumber(invoice.total_amount)}</p>
                                                            <Badge
                                                                className={
                                                                    invoice.status === 'paid'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {invoice.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Receipt className="mx-auto h-12 w-12 text-slate-300" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900">No invoices found</h3>
                                                <p className="mt-1 text-sm text-slate-500">No invoices have been generated for this customer yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Payments Tab */}
                            <TabsContent value="payments" className="mt-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payments</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Reference</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(customer.payments || []).length > 0 ? (
                                                    (customer.payments || []).map((p) => (
                                                        <TableRow key={p.id}>
                                                            <TableCell>{p.payment_date}</TableCell>
                                                            <TableCell>{formatNumber(p.amount_paid)}</TableCell>
                                                            <TableCell className="capitalize">{p.payment_method}</TableCell>
                                                            <TableCell>{p.reference_number || '—'}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center text-slate-500">
                                                            No payments found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>
                                {customer.first_name} {customer.last_name}
                            </strong>
                            ? This action cannot be undone and will permanently remove all customer data including:
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                <li>Customer profile information</li>
                                <li>Associated meter readings</li>
                                <li>Bills and invoices</li>
                                <li>Payment history</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                            Delete Customer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Payment Form Modal */}
            <PaymentFormModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                defaultValues={paymentDefaults}
                onSubmit={submitPayment}
                trigger={<span />}
                methods={[
                    { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
                    { value: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'bg-purple-100 text-purple-800' },
                    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
                    { value: 'cheque', label: 'Cheque', icon: FileText, color: 'bg-gray-100 text-gray-800' },
                ]}
            />

            {/* Invoice Payment Form Modal */}
            <InvoicePaymentFormModal
                open={invoicePaymentModalOpen}
                onOpenChange={setInvoicePaymentModalOpen}
                defaultValues={invoicePaymentDefaults}
                onSubmit={submitInvoicePayment}
                trigger={<span />}
                methods={[
                    { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
                    { value: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'bg-purple-100 text-purple-800' },
                    { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
                    { value: 'cheque', label: 'Cheque', icon: FileText, color: 'bg-gray-100 text-gray-800' },
                ]}
            />
        </AppLayout>
    );
}
