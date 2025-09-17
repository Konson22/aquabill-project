import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, DollarSign, FileText, Hash, Mail, MapPin, Phone, Save, User, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Create', href: '/invoices/create' },
];

export default function InvoiceCreate({ customers = [], meters = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        meter_id: '',
        invoice_number: '',
        reason: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        amount_due: '',
        status: 'pending',
    });

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/invoices', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCustomerChange = (customerId) => {
        setData('customer_id', customerId);
        const customer = customers.find((c) => c.id == customerId);
        setSelectedCustomer(customer);

        // Auto-generate invoice number if not provided
        if (!data.invoice_number) {
            const timestamp = Date.now().toString().slice(-6);
            setData('invoice_number', `INV-${timestamp}`);
        }
    };

    const handleIssueDateChange = (date) => {
        setData('issue_date', date);
        // Set due date to 30 days from issue date
        if (date) {
            const dueDate = new Date(date);
            dueDate.setDate(dueDate.getDate() + 30);
            setData('due_date', dueDate.toISOString().split('T')[0]);
        }
    };

    const filteredMeters = selectedCustomer ? meters.filter((meter) => meter.customer_id == selectedCustomer.id) : meters;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Invoice" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/invoices">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Invoices
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Invoice</h1>
                            <p className="text-slate-600 dark:text-slate-400">Generate a new service invoice for billing</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">
                        <FileText className="mr-1 h-3 w-3" />
                        New Invoice
                    </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Customer Selection Section */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="h-5 w-5 text-blue-600" />
                                Customer Selection
                            </CardTitle>
                            <CardDescription>Choose the customer and meter for this invoice</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Customer Selection */}
                                <div className="space-y-3">
                                    <Label htmlFor="customer_id" className="text-sm font-semibold">
                                        Customer <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.customer_id} onValueChange={handleCustomerChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search and select a customer..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400" />
                                                        <span className="font-medium">
                                                            {customer.first_name} {customer.last_name}
                                                        </span>
                                                        <span className="text-slate-500">- {customer.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.customer_id}
                                        </div>
                                    )}
                                </div>

                                {/* Meter Selection */}
                                <div className="space-y-3">
                                    <Label htmlFor="meter_id" className="text-sm font-semibold">
                                        Meter <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.meter_id} onValueChange={(value) => setData('meter_id', value)} disabled={!selectedCustomer}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectedCustomer ? 'Select a meter...' : 'Select customer first'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredMeters.map((meter) => (
                                                <SelectItem key={meter.id} value={meter.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Hash className="h-4 w-4 text-slate-400" />
                                                        <span className="font-medium">{meter.meter_number}</span>
                                                        <span className="text-slate-500">- {meter.location || 'No location'}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.meter_id && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.meter_id}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Customer Info */}
                            {selectedCustomer && (
                                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
                                    <h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                                        <User className="h-4 w-4 text-blue-600" />
                                        Selected Customer Details
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <User className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Full Name</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{selectedCustomer.email}</p>
                                                    <p className="text-xs text-slate-500">Email Address</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Phone className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {selectedCustomer.phone || 'Not provided'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Phone Number</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        {selectedCustomer.address || 'Not provided'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Address</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice Details Section */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Invoice Information */}
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    Invoice Information
                                </CardTitle>
                                <CardDescription>Enter the invoice details and description</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="invoice_number" className="text-sm font-semibold">
                                        Invoice Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="invoice_number"
                                        type="text"
                                        value={data.invoice_number}
                                        onChange={(e) => setData('invoice_number', e.target.value)}
                                        placeholder="e.g., INV-2024001"
                                    />
                                    {errors.invoice_number && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.invoice_number}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="reason" className="text-sm font-semibold">
                                        Reason for Invoice
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Enter a detailed reason for this invoice..."
                                        rows={4}
                                    />
                                    {errors.reason && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.reason}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="status" className="text-sm font-semibold">
                                        Invoice Status <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                    Pending
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    Paid
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                    Cancelled
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.status}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates & Amount */}
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    Dates & Amount
                                </CardTitle>
                                <CardDescription>Set invoice dates and billing amount</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="issue_date" className="text-sm font-semibold">
                                        Issue Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={data.issue_date}
                                        onChange={(e) => handleIssueDateChange(e.target.value)}
                                    />
                                    {errors.issue_date && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.issue_date}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="due_date" className="text-sm font-semibold">
                                        Due Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                    {errors.due_date && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.due_date}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="amount_due" className="text-sm font-semibold">
                                        Amount Due (SSP) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="amount_due"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount_due}
                                            onChange={(e) => setData('amount_due', e.target.value)}
                                            placeholder="0.00"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.amount_due && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.amount_due}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <Card className="bg-slate-50 dark:bg-slate-800/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <p>Review all information before creating the invoice</p>
                                    <p className="text-xs">This action cannot be undone</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href="/invoices">
                                        <Button type="button" variant="outline" size="lg">
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} size="lg">
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Creating Invoice...' : 'Create Invoice'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
