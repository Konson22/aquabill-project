import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import CustomerMeterForm from '@/pages/forms/customer-meter-form';
import { Head, Link, usePage } from '@inertiajs/react';
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
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Customers', href: '/customers' },
    { title: 'Profile', href: '#' },
];

export default function Show({ customer, availableMeters = [] }) {
    const page = usePage();
    const { auth } = page.props;
    const userDepartment = auth.user?.department?.name;
    const isBillingDepartment = userDepartment === 'Billing';

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showMeterModal, setShowMeterModal] = useState(false);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.first_name} ${customer.last_name}`} />

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-2xl font-bold text-white">
                            {customer.first_name?.[0]}
                            {customer.last_name?.[0]}
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
                    <div className="no-print flex space-x-2">
                        {!isBillingDepartment && (
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
                        <Button onClick={() => setShowMeterModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Manage Meters
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
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid h-auto w-full grid-cols-2 bg-slate-100 p-1 md:grid-cols-3 lg:grid-cols-5 dark:bg-slate-800">
                                <TabsTrigger
                                    value="overview"
                                    className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <Settings className="h-5 w-5" />
                                    <span className="text-xs font-medium">Overview</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meters"
                                    className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <Droplets className="h-5 w-5" />
                                    <span className="text-xs font-medium">Meter</span>
                                    {customer.meter && (
                                        <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                                            {customer.meter.status}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="readings"
                                    className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <Activity className="h-5 w-5" />
                                    <span className="text-xs font-medium">Readings</span>
                                    {customer.readings?.length > 0 && (
                                        <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                                            {customer.readings.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                {!isBillingDepartment && (
                                    <>
                                        <TabsTrigger
                                            value="bills"
                                            className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                        >
                                            <Receipt className="h-5 w-5" />
                                            <span className="text-xs font-medium">Bills</span>
                                            {customer.bills?.length > 0 && (
                                                <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                                                    {customer.bills.length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="invoices"
                                            className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                        >
                                            <FileText className="h-5 w-5" />
                                            <span className="text-xs font-medium">Invoices</span>
                                            {customer.invoices?.length > 0 && (
                                                <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                                                    {customer.invoices.length}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    </>
                                )}
                                <TabsTrigger
                                    value="payments"
                                    className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
                                >
                                    <CreditCard className="h-5 w-5" />
                                    <span className="text-xs font-medium">Payments</span>
                                    {customer.payments?.length > 0 && (
                                        <Badge variant="secondary" className="h-4 px-1 py-0 text-xs">
                                            {customer.payments.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Customer Summary */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <User className="mr-2 h-5 w-5" />
                                                Customer Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Account Status</span>
                                                <Badge className={getStatusColor(customer.is_active)}>
                                                    {customer.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Account Number</span>
                                                <span className="font-mono text-sm">{customer.account_number || 'Not assigned'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Member Since</span>
                                                <span className="text-sm">
                                                    {customer.date ? new Date(customer.date).toLocaleDateString() : 'Not provided'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Credit Balance</span>
                                                <span className="font-mono text-sm">${customer.credit || 0}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Activity */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Activity className="mr-2 h-5 w-5" />
                                                Recent Activity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {customer.readings?.length > 0 && (
                                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                                        <div className="flex items-center space-x-2">
                                                            <Activity className="h-4 w-4 text-blue-500" />
                                                            <span className="text-sm">Latest Reading</span>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            {customer.readings[customer.readings.length - 1].value} units
                                                        </span>
                                                    </div>
                                                )}
                                                {customer.payments?.length > 0 && (
                                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                                        <div className="flex items-center space-x-2">
                                                            <CreditCard className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm">Last Payment</span>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            ${customer.payments[customer.payments.length - 1].amount}
                                                        </span>
                                                    </div>
                                                )}
                                                {customer.bills?.length > 0 && (
                                                    <div className="flex items-center justify-between rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
                                                        <div className="flex items-center space-x-2">
                                                            <Receipt className="h-4 w-4 text-orange-500" />
                                                            <span className="text-sm">Latest Bill</span>
                                                        </div>
                                                        <span className="text-sm font-medium">
                                                            ${customer.bills[customer.bills.length - 1].total_amount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Quick Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Settings className="mr-2 h-5 w-5" />
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                            <Button variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                                <Plus className="h-5 w-5" />
                                                <span className="text-xs">Add Reading</span>
                                            </Button>
                                            <Button variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                                <Receipt className="h-5 w-5" />
                                                <span className="text-xs">Generate Bill</span>
                                            </Button>
                                            <Button variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                                                <CreditCard className="h-5 w-5" />
                                                <span className="text-xs">Record Payment</span>
                                            </Button>
                                            <a href={`/customers/${customer.id}/export`}>
                                                <Button variant="outline" className="flex h-auto w-full flex-col items-center space-y-2 p-4">
                                                    <Download className="h-5 w-5" />
                                                    <span className="text-xs">Export Data</span>
                                                </Button>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

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
                                                                    customer.meter.status === 'active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {customer.meter.status || 'Unknown'}
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
                                                                {customer.meter.readings?.length > 0
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
                                                                {customer.meter.readings?.length || 0}
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
                                                            {customer.meter.serial || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter.model || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Manufacturer</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter.manufactory || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Size</label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter.size || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
                                                        <div className="p-2">
                                                            <Badge
                                                                className={
                                                                    customer.meter.status === 'active'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }
                                                            >
                                                                {customer.meter.status || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            Installation Date
                                                        </label>
                                                        <p className="rounded bg-slate-100 p-2 text-sm dark:bg-slate-800">
                                                            {customer.meter.created_at
                                                                ? new Date(customer.meter.created_at).toLocaleDateString()
                                                                : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Meter Logs */}
                                        {customer.meterLogs && customer.meterLogs.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center">
                                                        <Activity className="mr-2 h-5 w-5" />
                                                        Meter History
                                                    </CardTitle>
                                                    <CardDescription>Meter changes and maintenance logs</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Action</TableHead>
                                                                <TableHead>Old Meter</TableHead>
                                                                <TableHead>New Meter</TableHead>
                                                                <TableHead>Performed By</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.meterLogs.map((log, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">{log.action || 'Unknown'}</Badge>
                                                                    </TableCell>
                                                                    <TableCell>{log.oldMeter?.serial || 'N/A'}</TableCell>
                                                                    <TableCell>{log.newMeter?.serial || 'N/A'}</TableCell>
                                                                    <TableCell>{log.performedBy?.name || 'N/A'}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            </Card>
                                        )}
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

                            {!isBillingDepartment && (
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
                                                                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
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
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Meter Management Modal */}
            <Dialog open={showMeterModal} onOpenChange={setShowMeterModal} className="no-print">
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <Droplets className="mr-2 h-5 w-5" />
                            Manage Customer Meter
                        </DialogTitle>
                        <DialogDescription>
                            Assign or change the meter for {customer.first_name} {customer.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <CustomerMeterForm
                            customer={customer}
                            availableMeters={availableMeters}
                            onSuccess={() => {
                                setShowMeterModal(false);
                                // Refresh the page to show updated meter information
                                window.location.reload();
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
