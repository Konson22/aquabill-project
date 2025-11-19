import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Calendar,
    ChevronDown,
    CreditCard,
    Download,
    Droplets,
    Edit,
    FileText,
    Mail,
    MapPin,
    Phone,
    Plus,
    Printer,
    Receipt,
    Settings,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    { title: 'Customers', href: '/customers' },
    { title: 'Profile', href: '#' },
];

export default function Show({ customer, availableMeters = [] }) {
    const page = usePage();
    const { auth, errors = {} } = page.props;
    const userDepartment = auth.user?.department?.name;
    const isBillingDepartment = userDepartment === 'Billing';
    const isFinanceDepartment = userDepartment === 'Finance';

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignMeterModal, setShowAssignMeterModal] = useState(false);
    const [showManageMeterModal, setShowManageMeterModal] = useState(false);
    const [selectedMeterId, setSelectedMeterId] = useState('');
    const [selectedMeterStatus, setSelectedMeterStatus] = useState('');
    const [previousReading, setPreviousReading] = useState('');

    const getStatusColor = (isActive) => {
        return isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Get the content to print (excluding sidebar and navbar)
        const contentToPrint = document.getElementById('printable-content');

        if (contentToPrint) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Customer Profile - ${customer.first_name} ${customer.last_name}</title>
                    <style>
                        @media print {
                            @page {
                                margin: 0.5in;
                                size: A4;
                            }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .print-header {
                                text-align: center;
                                margin-bottom: 2rem;
                                padding-bottom: 1rem;
                                border-bottom: 2px solid #e5e7eb;
                            }
                            .print-title {
                                font-size: 24px;
                                font-weight: bold;
                                margin-bottom: 0.5rem;
                            }
                            .print-subtitle {
                                color: #6b7280;
                                font-size: 14px;
                            }
                            .print-section {
                                margin-bottom: 1.5rem;
                                page-break-inside: avoid;
                            }
                            .print-section-title {
                                font-size: 18px;
                                font-weight: 600;
                                margin-bottom: 1rem;
                                color: #1f2937;
                                border-bottom: 1px solid #e5e7eb;
                                padding-bottom: 0.5rem;
                            }
                            .print-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                gap: 1rem;
                                margin-bottom: 1rem;
                            }
                            .print-card {
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 1rem;
                                background: #f9fafb;
                            }
                            .print-card-title {
                                font-weight: 600;
                                margin-bottom: 0.5rem;
                                color: #374151;
                            }
                            .print-info {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 0.25rem;
                                font-size: 14px;
                            }
                            .print-label {
                                color: #6b7280;
                            }
                            .print-value {
                                font-weight: 500;
                            }
                            .print-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 1rem;
                            }
                            .print-table th,
                            .print-table td {
                                border: 1px solid #e5e7eb;
                                padding: 0.5rem;
                                text-align: left;
                                font-size: 12px;
                            }
                            .print-table th {
                                background-color: #f3f4f6;
                                font-weight: 600;
                            }
                            .print-badge {
                                display: inline-block;
                                padding: 0.25rem 0.5rem;
                                border-radius: 4px;
                                font-size: 12px;
                                font-weight: 500;
                            }
                            .print-badge-active {
                                background-color: #dcfce7;
                                color: #166534;
                            }
                            .print-badge-inactive {
                                background-color: #fef2f2;
                                color: #991b1b;
                            }
                            .print-badge-paid {
                                background-color: #dcfce7;
                                color: #166534;
                            }
                            .print-badge-pending {
                                background-color: #fef3c7;
                                color: #92400e;
                            }
                            .print-badge-overdue {
                                background-color: #fef2f2;
                                color: #991b1b;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${contentToPrint.innerHTML}
                </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    const handleDeleteCustomer = () => {
        router.delete(`/customers/${customer.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                // Redirect to customers index page after successful deletion
                router.visit('/customers');
            },
            onError: (errors) => {
                console.error('Error deleting customer:', errors);
                setShowDeleteDialog(false);
            },
        });
    };

    const handleAssignMeter = () => {
        if (!selectedMeterId || previousReading === '') {
            return;
        }

        router.post(
            `/customers/${customer.id}/assign-meter`,
            {
                meter_id: selectedMeterId,
                previous_reading: Number(previousReading),
            },
            {
                onSuccess: () => {
                    setShowAssignMeterModal(false);
                    setSelectedMeterId('');
                    setPreviousReading('');
                    // Refresh the page to show the updated meter information
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error assigning meter:', errors);
                },
            },
        );
    };

    const handleUpdateMeterStatus = () => {
        if (!selectedMeterStatus || !customer.meter) {
            return;
        }

        router.post(
            `/customers/${customer.id}/update-meter-status`,
            {
                meter_id: customer.meter.id,
                status: selectedMeterStatus,
            },
            {
                onSuccess: () => {
                    setShowManageMeterModal(false);
                    setSelectedMeterStatus('');
                    // Refresh the page to show the updated meter information
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Error updating meter status:', errors);
                },
            },
        );
    };

    const handleReplaceMeter = () => {
        setShowManageMeterModal(false);
        setShowAssignMeterModal(true);
    };

    useEffect(() => {
        if (!showAssignMeterModal) {
            setSelectedMeterId('');
            setPreviousReading('');
        }
    }, [showAssignMeterModal]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.first_name} ${customer.last_name}`} />

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="no-print flex space-x-2">
                        {!isBillingDepartment && !isFinanceDepartment && (
                            <>
                                <Link href={`/customers/${customer.id}/edit`}>
                                    <Button variant="outline">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export`} className="flex items-center">
                                                <User className="mr-2 h-4 w-4" />
                                                Export All Data
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export-readings`} className="flex items-center">
                                                <Activity className="mr-2 h-4 w-4" />
                                                Export Readings
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export-bills`} className="flex items-center">
                                                <Receipt className="mr-2 h-4 w-4" />
                                                Export Bills
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </>
                        )}
                        {isFinanceDepartment && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Excel
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export`} className="flex items-center">
                                                <User className="mr-2 h-4 w-4" />
                                                Export All Data
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export-readings`} className="flex items-center">
                                                <Activity className="mr-2 h-4 w-4" />
                                                Export Readings
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`/customers/${customer.id}/export-bills`} className="flex items-center">
                                                <Receipt className="mr-2 h-4 w-4" />
                                                Export Bills
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                        <Button onClick={() => (customer.meter ? setShowManageMeterModal(true) : setShowAssignMeterModal(true))}>
                            <Plus className="mr-2 h-4 w-4" />
                            {customer.meter ? 'Manage Meter' : 'Assign Meter'}
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </div>

            {/* Customer Basic Information */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <User className="mr-2 h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{customer.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{customer.email || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{customer.address || 'Not provided'}</span>
                        </div>
                        {customer.plot_number && (
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">Plot: {customer.plot_number}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Settings className="mr-2 h-5 w-5" />
                            Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">Account: #{customer.account_number || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">Joined: {customer.date ? new Date(customer.date).toLocaleDateString() : 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(customer.is_active)}>{customer.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        {customer.credit && (
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">Credit: ${customer.credit}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <MapPin className="mr-2 h-5 w-5" />
                            Location & Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{customer.neighborhood?.name || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">{customer.category?.name || 'Not assigned'}</span>
                        </div>
                        {customer.latitude && customer.longitude && (
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">
                                    GPS: {customer.latitude}, {customer.longitude}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div id="printable-content" className="space-y-6">
                {/* Print Header - Only visible when printing */}
                <div className="print-header no-print">
                    <div className="print-title">Customer Profile</div>
                    <div className="print-subtitle">
                        {customer.first_name} {customer.last_name} - Account #{customer.account_number || 'N/A'}
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Readings</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{customer.readings?.length || 0}</p>
                                </div>
                                <Activity className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Bills</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{customer.bills?.length || 0}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Payments</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{customer.payments?.length || 0}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Outstanding</p>
                                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                        $
                                        {customer.bills
                                            ?.filter((bill) => bill.status !== 'paid')
                                            .reduce((sum, bill) => sum + (bill.total_amount || 0), 0) || 0}
                                    </p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-xl">
                            <Settings className="mr-3 h-6 w-6" />
                            Customer Details
                        </CardTitle>
                        <CardDescription className="text-base">
                            Comprehensive view of customer information, meter data, and transaction history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="meters" className="w-full">
                            <TabsList className="flex h-auto w-full overflow-x-auto bg-slate-100 p-1 dark:bg-slate-800">
                                <TabsTrigger
                                    value="meters"
                                    className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <Droplets className="h-4 w-4" />
                                    <span className="text-sm font-medium">Meter</span>
                                    {customer.meter && (
                                        <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                                            {customer.meter?.status || 'Unknown'}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="readings"
                                    className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <Activity className="h-4 w-4" />
                                    <span className="text-sm font-medium">Readings</span>
                                    {customer.readings?.length > 0 && (
                                        <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                                            {customer.readings.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                {!isBillingDepartment && !isFinanceDepartment && (
                                    <>
                                        <TabsTrigger
                                            value="bills"
                                            className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                        >
                                            <Receipt className="h-4 w-4" />
                                            <span className="text-sm font-medium">Bills</span>
                                            {customer.bills?.length > 0 && (
                                                <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                                                    {customer.bills.length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="invoices"
                                            className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm font-medium">Invoices</span>
                                            {customer.invoices?.length > 0 && (
                                                <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                                                    {customer.invoices.length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </>
                                )}
                                {!isBillingDepartment && (
                                    <TabsTrigger
                                        value="payments"
                                        className="flex items-center space-x-2 px-4 py-2 whitespace-nowrap data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span className="text-sm font-medium">Payments</span>
                                        {customer.payments?.length > 0 && (
                                            <Badge variant="secondary" className="h-5 px-1.5 py-0 text-xs">
                                                {customer.payments.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <TabsContent value="meters" className="mt-6 space-y-6">
                                {customer.meter ? (
                                    <div className="space-y-6">
                                        {/* Meter Status Overview */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Meter Status</p>
                                                            <Badge
                                                                className={
                                                                    customer.meter?.status === 'active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {customer.meter?.status || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                        <Droplets className="h-8 w-8 text-blue-500" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Last Reading</p>
                                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                                {customer.meter?.readings?.length > 0
                                                                    ? customer.meter.readings[customer.meter.readings.length - 1].value
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                        <Activity className="h-8 w-8 text-green-500" />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Readings</p>
                                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                                {customer.meter?.readings?.length || 0}
                                                            </p>
                                                        </div>
                                                        <Settings className="h-8 w-8 text-purple-500" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Current Meter Information */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <Droplets className="mr-2 h-5 w-5" />
                                                    Meter Details
                                                </CardTitle>
                                                <CardDescription>Complete information about the assigned meter</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            Serial Number
                                                        </label>
                                                        <p className="rounded bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800">
                                                            {customer.meter?.serial || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter?.model || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Manufacturer</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter?.manufactory || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Size</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter?.size || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                                        <div className="p-2">
                                                            <Badge
                                                                className={
                                                                    customer.meter?.status === 'active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {customer.meter?.status || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            Installation Date
                                                        </label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter?.created_at
                                                                ? new Date(customer.meter.created_at).toLocaleDateString()
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Meter History */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <Activity className="mr-2 h-5 w-5" />
                                                    Meter History
                                                </CardTitle>
                                                <CardDescription>
                                                    Complete history of meter changes, maintenance, and readings for this customer
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {customer.meterLogs && customer.meterLogs.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {/* Summary Stats */}
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                                                <div className="flex items-center">
                                                                    <Settings className="h-5 w-5 text-blue-600" />
                                                                    <div className="ml-2">
                                                                        <p className="text-sm font-medium text-blue-600">Total Changes</p>
                                                                        <p className="text-2xl font-bold text-blue-900">
                                                                            {customer.meterLogs.length}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                                                <div className="flex items-center">
                                                                    <Droplets className="h-5 w-5 text-green-600" />
                                                                    <div className="ml-2">
                                                                        <p className="text-sm font-medium text-green-600">Current Meter</p>
                                                                        <p className="text-lg font-bold text-green-900">
                                                                            {customer.meter?.serial || 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                                                <div className="flex items-center">
                                                                    <Calendar className="h-5 w-5 text-purple-600" />
                                                                    <div className="ml-2">
                                                                        <p className="text-sm font-medium text-purple-600">Last Change</p>
                                                                        <p className="text-sm font-bold text-purple-900">
                                                                            {customer.meterLogs.length > 0
                                                                                ? new Date(customer.meterLogs[0].created_at).toLocaleDateString()
                                                                                : 'N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* History Timeline */}
                                                        <div className="space-y-3">
                                                            <h4 className="text-lg font-semibold">Timeline</h4>
                                                            <div className="space-y-2">
                                                                {customer.meterLogs
                                                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                                    .map((log, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                        >
                                                                            <div className="flex-shrink-0">
                                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                                                    <Settings className="h-4 w-4 text-blue-600" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center justify-between">
                                                                                    <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                                        {log.action || 'Meter Change'}
                                                                                    </h5>
                                                                                    <time className="text-xs text-slate-500 dark:text-slate-400">
                                                                                        {log.created_at
                                                                                            ? new Date(log.created_at).toLocaleDateString()
                                                                                            : 'N/A'}
                                                                                    </time>
                                                                                </div>
                                                                                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                                    {log.oldMeter && (
                                                                                        <div className="text-sm">
                                                                                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                                                                                From:
                                                                                            </span>
                                                                                            <span className="ml-1 font-mono">
                                                                                                {log.oldMeter.serial}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {log.newMeter && (
                                                                                        <div className="text-sm">
                                                                                            <span className="font-medium text-slate-600 dark:text-slate-400">
                                                                                                To:
                                                                                            </span>
                                                                                            <span className="ml-1 font-mono">
                                                                                                {log.newMeter.serial}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {log.performedBy && (
                                                                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                                                        Performed by: {log.performedBy.name}
                                                                                    </div>
                                                                                )}
                                                                                {log.note && (
                                                                                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                                                                        <span className="font-medium">Note:</span> {log.note}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        {/* Detailed Table View */}
                                                        <div className="mt-6">
                                                            <h4 className="mb-4 text-lg font-semibold">Detailed History</h4>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Date</TableHead>
                                                                        <TableHead>Action</TableHead>
                                                                        <TableHead>Old Meter</TableHead>
                                                                        <TableHead>New Meter</TableHead>
                                                                        <TableHead>Performed By</TableHead>
                                                                        <TableHead>Notes</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {customer.meterLogs
                                                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                                        .map((log, index) => (
                                                                            <TableRow key={index}>
                                                                                <TableCell>
                                                                                    {log.created_at
                                                                                        ? new Date(log.created_at).toLocaleDateString()
                                                                                        : 'N/A'}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Badge variant="outline">{log.action || 'Unknown'}</Badge>
                                                                                </TableCell>
                                                                                <TableCell className="font-mono">
                                                                                    {log.oldMeter?.serial || 'N/A'}
                                                                                </TableCell>
                                                                                <TableCell className="font-mono">
                                                                                    {log.newMeter?.serial || 'N/A'}
                                                                                </TableCell>
                                                                                <TableCell>{log.performedBy?.name || 'N/A'}</TableCell>
                                                                                <TableCell className="max-w-xs truncate">{log.note || '-'}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-8 text-center">
                                                        <Activity className="mx-auto h-12 w-12 text-slate-400" />
                                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                            No meter history
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-500">
                                                            No meter changes or maintenance records found for this customer.
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Droplets className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No meter assigned</h3>
                                        <p className="mt-1 text-sm text-slate-500">This customer doesn't have a meter assigned yet.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="readings" className="mt-6 space-y-6">
                                {customer.readings && customer.readings.length > 0 ? (
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center">
                                                        <Activity className="mr-2 h-5 w-5" />
                                                        Meter Readings History
                                                    </CardTitle>
                                                    <CardDescription>All meter readings for this customer</CardDescription>
                                                </div>
                                                <a href={`/customers/${customer.id}/export-readings`}>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Export
                                                    </Button>
                                                </a>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Previous Reading</TableHead>
                                                        <TableHead>Current Reading</TableHead>
                                                        <TableHead>Consumption</TableHead>
                                                        <TableHead>Source</TableHead>
                                                        <TableHead>Officer</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {customer.readings
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .map((reading, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell>
                                                                    {reading.date ? new Date(reading.date).toLocaleDateString() : 'N/A'}
                                                                </TableCell>
                                                                <TableCell>{reading.previous || 0}</TableCell>
                                                                <TableCell className="font-medium">{reading.value || 0}</TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{reading.value - reading.previous || 0} units</Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={reading.source === 'manual' ? 'default' : 'secondary'}>
                                                                        {reading.source || 'Unknown'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{reading.recordedBy?.name || 'N/A'}</TableCell>
                                                                <TableCell className="max-w-xs truncate">{reading.note || '-'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Activity className="mx-auto h-12 w-12 text-slate-400" />
                                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No readings found</h3>
                                        <p className="mt-1 text-sm text-slate-500">No meter readings have been recorded for this customer yet.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {!isBillingDepartment && !isFinanceDepartment && (
                                <>
                                    <TabsContent value="bills" className="mt-6 space-y-4">
                                        {customer.bills && customer.bills.length > 0 ? (
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="flex items-center">
                                                                <Receipt className="mr-2 h-5 w-5" />
                                                                Bills History
                                                            </CardTitle>
                                                            <CardDescription>All bills generated for this customer</CardDescription>
                                                        </div>
                                                        <a href={`/customers/${customer.id}/export-bills`}>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Export
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Bill Number</TableHead>
                                                                <TableHead>Period</TableHead>
                                                                <TableHead>Amount</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Due Date</TableHead>
                                                                <TableHead>Generated By</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.bills
                                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                                .map((bill, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="font-medium">#{bill.bill_number || bill.id}</TableCell>
                                                                        <TableCell>
                                                                            {bill.period_from && bill.period_to
                                                                                ? `${new Date(bill.period_from).toLocaleDateString()} - ${new Date(bill.period_to).toLocaleDateString()}`
                                                                                : 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell>${bill.total_amount || 0}</TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                className={
                                                                                    bill.status === 'paid'
                                                                                        ? 'bg-green-100 text-green-800'
                                                                                        : bill.status === 'overdue'
                                                                                          ? 'bg-red-100 text-red-800'
                                                                                          : 'bg-yellow-100 text-yellow-800'
                                                                                }
                                                                            >
                                                                                {bill.status || 'Unknown'}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell>{bill.generatedBy?.name || 'N/A'}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Receipt className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No bills found</h3>
                                                <p className="mt-1 text-sm text-slate-500">No bills have been generated for this customer yet.</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="invoices" className="mt-6 space-y-4">
                                        {customer.invoices && customer.invoices.length > 0 ? (
                                            <Card>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="flex items-center">
                                                                <FileText className="mr-2 h-5 w-5" />
                                                                Invoices History
                                                            </CardTitle>
                                                            <CardDescription>All invoices generated for this customer</CardDescription>
                                                        </div>
                                                        <a href={`/customers/${customer.id}/export`}>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Export
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Invoice Number</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Amount</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Due Date</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.invoices
                                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                                .map((invoice, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="font-medium">
                                                                            #{invoice.invoice_number || invoice.id}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {invoice.created_at
                                                                                ? new Date(invoice.created_at).toLocaleDateString()
                                                                                : 'N/A'}
                                                                        </TableCell>
                                                                        <TableCell>${invoice.total_amount || 0}</TableCell>
                                                                        <TableCell>
                                                                            <Badge
                                                                                className={
                                                                                    invoice.status === 'paid'
                                                                                        ? 'bg-green-100 text-green-800'
                                                                                        : invoice.status === 'overdue'
                                                                                          ? 'bg-red-100 text-red-800'
                                                                                          : 'bg-yellow-100 text-yellow-800'
                                                                                }
                                                                            >
                                                                                {invoice.status || 'Unknown'}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {invoice.due_date
                                                                                ? new Date(invoice.due_date).toLocaleDateString()
                                                                                : 'N/A'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                                                <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No invoices found</h3>
                                                <p className="mt-1 text-sm text-slate-500">No invoices have been generated for this customer yet.</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </>
                            )}

                            {!isBillingDepartment && (
                                <TabsContent value="payments" className="mt-6 space-y-4">
                                    {customer.payments && customer.payments.length > 0 ? (
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center">
                                                            <Receipt className="mr-2 h-5 w-5" />
                                                            Payment History
                                                        </CardTitle>
                                                        <CardDescription>All payments made by this customer</CardDescription>
                                                    </div>
                                                    <a href={`/customers/${customer.id}/export`}>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Export
                                                        </Button>
                                                    </a>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Payment Date</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Method</TableHead>
                                                            <TableHead>Reference</TableHead>
                                                            <TableHead>Status</TableHead>
                                                            <TableHead>Received By</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {customer.payments
                                                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                            .map((payment, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {payment.created_at
                                                                            ? new Date(payment.created_at).toLocaleDateString()
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">${payment.amount || 0}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">{payment.method || 'Unknown'}</Badge>
                                                                    </TableCell>
                                                                    <TableCell>{payment.reference || 'N/A'}</TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            className={
                                                                                payment.status === 'completed'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : payment.status === 'pending'
                                                                                      ? 'bg-yellow-100 text-yellow-800'
                                                                                      : 'bg-red-100 text-red-800'
                                                                            }
                                                                        >
                                                                            {payment.status || 'Unknown'}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>{payment.receivedBy?.name || 'N/A'}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <Receipt className="mx-auto h-12 w-12 text-slate-400" />
                                            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No payments found</h3>
                                            <p className="mt-1 text-sm text-slate-500">No payments have been recorded for this customer yet.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            )}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Assign Meter Modal */}
            <Dialog open={showAssignMeterModal} onOpenChange={setShowAssignMeterModal} className="no-print">
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Plus className="mr-2 h-5 w-5" />
                            Assign Meter to Customer
                        </DialogTitle>
                        <DialogDescription>
                            Assign a meter to {customer.first_name} {customer.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="space-y-6">
                            {/* Meter Selection */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Available Meter</label>
                                    {availableMeters && availableMeters.length > 0 ? (
                                        <Select value={selectedMeterId} onValueChange={setSelectedMeterId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose a meter to assign..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableMeters.map((meter) => (
                                                    <SelectItem key={meter.id} value={meter.id.toString()}>
                                                        <div className="flex w-full items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Droplets className="h-4 w-4 text-green-600" />
                                                                <div>
                                                                    <div className="font-medium">{meter.serial}</div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {meter.model} - {meter.manufactory}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <div
                                                                    className={`h-2 w-2 rounded-full ${
                                                                        meter.status === 'active'
                                                                            ? 'bg-green-500'
                                                                            : meter.status === 'inactive'
                                                                              ? 'bg-red-500'
                                                                              : meter.status === 'maintenance'
                                                                                ? 'bg-yellow-500'
                                                                                : meter.status === 'damaged'
                                                                                  ? 'bg-orange-500'
                                                                                  : 'bg-gray-500'
                                                                    }`}
                                                                ></div>
                                                                <span className="text-xs text-slate-600 capitalize">{meter.status || 'Unknown'}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                                            <p className="mt-2 text-sm text-slate-500">No available meters found</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Previous Reading</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter latest reading value"
                                        value={previousReading}
                                        onChange={(e) => setPreviousReading(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500">
                                        This value becomes the current reading for the new meter. Previous reading will be set to 0 automatically.
                                    </p>
                                    {errors.previous_reading && <p className="text-xs text-red-600">{errors.previous_reading}</p>}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowAssignMeterModal(false);
                                        setSelectedMeterId('');
                                        setPreviousReading('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssignMeter}
                                    disabled={!selectedMeterId || previousReading === ''}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Assign Meter
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Meter Modal */}
            <Dialog open={showManageMeterModal} onOpenChange={setShowManageMeterModal} className="no-print">
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Manage Customer Meter
                        </DialogTitle>
                        <DialogDescription>
                            Manage the current meter for {customer.first_name} {customer.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="space-y-6">
                            {/* Current Meter Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Droplets className="mr-2 h-5 w-5" />
                                        Current Meter
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Serial Number</label>
                                            <p className="rounded bg-slate-100 p-2 font-mono text-sm dark:bg-slate-800">
                                                {customer.meter?.serial || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                            <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">{customer.meter?.model || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                            <Select
                                                value={selectedMeterStatus || customer.meter?.status || ''}
                                                onValueChange={setSelectedMeterStatus}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select meter status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                            <span>Active</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                            <span>Inactive</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="maintenance">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                            <span>Maintenance</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="damaged">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                            <span>Damaged</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleReplaceMeter} className="bg-orange-600 text-white hover:bg-orange-700">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Replace Meter
                                </Button>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowManageMeterModal(false);
                                            setSelectedMeterStatus('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateMeterStatus}
                                        disabled={!selectedMeterStatus || selectedMeterStatus === customer.meter?.status}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Update Status
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} className="no-print">
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertCircle className="mr-2 h-5 w-5" />
                            Delete Customer
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Are you sure you want to delete{' '}
                            <strong>
                                {customer.first_name} {customer.last_name}
                            </strong>
                            ? This action cannot be undone and will permanently remove all customer data including:
                            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                <li>Customer profile information</li>
                                <li>Meter readings and history</li>
                                <li>Bills and invoices</li>
                                <li>Payment records</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCustomer} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
