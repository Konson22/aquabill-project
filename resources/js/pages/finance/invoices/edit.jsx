import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    { title: 'Finance', href: '/finance' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Edit', href: '#' },
];

export default function InvoiceEdit({ invoice, customers = [], meters = [] }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        customer_id: invoice.customer_id?.toString() || '',
        meter_id: invoice.meter_id?.toString() || '',
        invoice_number: invoice.invoice_number || '',
        reason: invoice.reason || '',
        issue_date: invoice.issue_date || '',
        due_date: invoice.due_date || '',
        amount_due: invoice.amount_due?.toString() || '',
        status: invoice.status || 'pending',
    });

    const [selectedCustomer, setSelectedCustomer] = useState(customers.find((c) => c.id == invoice.customer_id) || null);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/invoices/${invoice.id}`, {
            onSuccess: () => {
                // Optionally show success message
            },
        });
    };

    const handleCustomerChange = (customerId) => {
        setData('customer_id', customerId);
        const customer = customers.find((c) => c.id == customerId);
        setSelectedCustomer(customer);
    };

    const handleIssueDateChange = (date) => {
        setData('issue_date', date);
        // Auto-suggest due date if not already set
        if (date && !data.due_date) {
            const dueDate = new Date(date);
            dueDate.setDate(dueDate.getDate() + 30);
            setData('due_date', dueDate.toISOString().split('T')[0]);
        }
    };

    const filteredMeters = selectedCustomer ? meters.filter((meter) => meter.customer_id == selectedCustomer.id) : meters;

    // Update filtered meters when customer changes
    useEffect(() => {
        if (selectedCustomer) {
            const customerMeters = meters.filter((meter) => meter.customer_id == selectedCustomer.id);
            if (customerMeters.length > 0 && !customerMeters.find((m) => m.id == data.meter_id)) {
                setData('meter_id', '');
            }
        }
    }, [selectedCustomer, meters, data.meter_id, setData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Invoice #${invoice.invoice_number || invoice.id}`} />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/invoices/${invoice.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoice
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Edit Invoice #{invoice.invoice_number || invoice.id}
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Update invoice information</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                            <CardDescription>Select the customer for this invoice</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="customer_id">Customer *</Label>
                                <Select value={data.customer_id} onValueChange={handleCustomerChange}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.first_name} {customer.last_name} - {customer.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                            </div>

                            {selectedCustomer && (
                                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Selected Customer</h4>
                                    <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                        <p>
                                            <strong>Name:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {selectedCustomer.email}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}
                                        </p>
                                        <p>
                                            <strong>Address:</strong> {selectedCustomer.address || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="meter_id">Meter *</Label>
                                <Select value={data.meter_id} onValueChange={(value) => setData('meter_id', value)} disabled={!selectedCustomer}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={selectedCustomer ? 'Select a meter' : 'Select customer first'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredMeters.map((meter) => (
                                            <SelectItem key={meter.id} value={meter.id.toString()}>
                                                {meter.meter_number} - {meter.location || 'No location'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.meter_id && <p className="mt-1 text-sm text-red-600">{errors.meter_id}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoice Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                            <CardDescription>Enter invoice information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="invoice_number">Invoice Number *</Label>
                                <Input
                                    id="invoice_number"
                                    type="text"
                                    value={data.invoice_number}
                                    onChange={(e) => setData('invoice_number', e.target.value)}
                                    placeholder="e.g., INV-2024001"
                                    className="mt-1"
                                />
                                {errors.invoice_number && <p className="mt-1 text-sm text-red-600">{errors.invoice_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="Enter reason for this invoice..."
                                    className="mt-1"
                                    rows={3}
                                />
                                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                            </div>

                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dates and Amount */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dates & Amount</CardTitle>
                        <CardDescription>Set invoice dates and amount due</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="issue_date">Issue Date *</Label>
                                <Input
                                    id="issue_date"
                                    type="date"
                                    value={data.issue_date}
                                    onChange={(e) => handleIssueDateChange(e.target.value)}
                                    className="mt-1"
                                />
                                {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="due_date">Due Date *</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="amount_due">Amount Due (SSP) *</Label>
                                <Input
                                    id="amount_due"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.amount_due}
                                    onChange={(e) => setData('amount_due', e.target.value)}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                                {errors.amount_due && <p className="mt-1 text-sm text-red-600">{errors.amount_due}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment History (Read-only) */}
                {invoice.payments && invoice.payments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>Payments received for this invoice (read-only)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                                        <div>
                                            <div className="font-medium">
                                                SSP{' '}
                                                {parseFloat(payment.amount_paid || 0).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {payment.payment_date
                                                    ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                      })
                                                    : '—'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium capitalize">
                                                {String(payment.payment_method || '').replace('_', ' ')}
                                            </div>
                                            <div className="text-sm text-slate-500">{payment.reference_number || '—'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button asChild variant="outline">
                        <Link href={`/invoices/${invoice.id}`}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Updating...' : 'Update Invoice'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
