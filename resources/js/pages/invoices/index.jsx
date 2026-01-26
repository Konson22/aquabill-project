import CreateInvoiceModal from '@/components/invoices/create-invoice-modal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Eye, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Invoices({ invoices, filters = {}, tariffs = [] }) {
    const { delete: destroy } = useForm();
    const [payOpen, setPayOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);
    const [selected, setSelected] = useState(new Set());

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(
                new Set(
                    invoices.data
                        .filter((inv) => inv.status !== 'paid')
                        .map((inv) => inv.id),
                ),
            );
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleBulkPrint = () => {
        const ids = Array.from(selected).join(',');
        const url = route('invoices.bulk-print', { ids });
        window.open(url, '_blank');
    };

    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: payProcessing,
        errors: payErrors,
        reset: resetPay,
    } = useForm({
        invoice_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    const updateParams = (newParams) => {
        const currentParams = { ...filters, ...newParams };
        // Remove empty keys
        Object.keys(currentParams).forEach(
            (key) => !currentParams[key] && delete currentParams[key],
        );

        router.get(route('invoices'), currentParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = (id) => {
        destroy(route('invoices.destroy', id), {
            preserveScroll: true,
        });
    };

    const handlePayClick = (invoice) => {
        setPaymentInvoice(invoice);
        const paid =
            invoice.payments?.reduce((sum, p) => sum + Number(p.amount), 0) ||
            0;
        const balance = Number(invoice.amount) - paid;

        setPayData({
            invoice_id: invoice.id,
            amount: invoice.amount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            reference_number: '',
            notes: '',
        });
        setPayOpen(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('payments.store'), {
            onSuccess: () => {
                setPayOpen(false);
                resetPay();
                setPaymentInvoice(null);
            },
        });
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Invoices',
            href: route('invoices'),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="mb-4 flex flex-row items-center justify-between gap-4 space-y-0">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold">Invoices</h3>
                    <CreateInvoiceModal
                        trigger={
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Invoice
                            </Button>
                        }
                    />
                    {selected.size > 0 && (
                        <Button
                            variant="default"
                            onClick={handleBulkPrint}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print Selected ({selected.size})
                        </Button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-[180px]">
                        <Select
                            value={filters.month || 'all'}
                            onValueChange={(val) =>
                                updateParams({
                                    month: val === 'all' ? '' : val,
                                })
                            }
                        >
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="All Months" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {Array.from({ length: 12 }).map((_, i) => {
                                    const date = new Date();
                                    date.setMonth(date.getMonth() - i);
                                    const value = date
                                        .toISOString()
                                        .slice(0, 7); // YYYY-MM
                                    const label = date.toLocaleString(
                                        'default',
                                        {
                                            month: 'long',
                                            year: 'numeric',
                                        },
                                    );
                                    return (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="bg-white pl-8"
                            defaultValue={filters.search || ''}
                            onChange={(e) =>
                                updateParams({ search: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={
                                            invoices.data.filter(
                                                (inv) => inv.status !== 'paid',
                                            ).length > 0 &&
                                            selected.size ===
                                                invoices.data.filter(
                                                    (inv) =>
                                                        inv.status !== 'paid',
                                                ).length
                                        }
                                        onCheckedChange={toggleAll}
                                        disabled={
                                            invoices.data.filter(
                                                (inv) => inv.status !== 'paid',
                                            ).length === 0
                                        }
                                        aria-label="Select all pending"
                                        className="border-gray-500"
                                    />
                                </TableHead>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length > 0 ? (
                                invoices.data.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.has(
                                                    invoice.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleOne(invoice.id)
                                                }
                                                disabled={
                                                    invoice.status === 'paid'
                                                }
                                                aria-label={`Select invoice ${invoice.id}`}
                                                className="border-gray-500"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {invoice.invoice_number}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {invoice.customer?.name ||
                                                    'Unknown'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {invoice.type}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(invoice.amount)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(invoice.due_date)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    invoice.status === 'paid'
                                                        ? 'default'
                                                        : invoice.status ===
                                                            'overdue'
                                                          ? 'destructive'
                                                          : 'outline'
                                                }
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {invoice.status !== 'paid' && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:hover:bg-purple-900"
                                                        onClick={() =>
                                                            handlePayClick(
                                                                invoice,
                                                            )
                                                        }
                                                        title="Pay Invoice"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'invoices.show',
                                                            invoice.id,
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
                                                    asChild
                                                >
                                                    <a
                                                        href={route(
                                                            'invoices.print',
                                                            invoice.id,
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Are you sure?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action
                                                                cannot be
                                                                undone. This
                                                                will permanently
                                                                delete the
                                                                invoice.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        invoice.id,
                                                                    )
                                                                }
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-24 text-center"
                                    >
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex w-full items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {invoices.from || 0} to {invoices.to || 0} of{' '}
                        {invoices.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {invoices.links &&
                            invoices.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                    </div>
                </CardFooter>
            </Card>

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitPayment} className="grid gap-4 py-4">
                        <div className="mb-2 text-sm text-muted-foreground">
                            <p>
                                <strong>Invoice #:</strong>{' '}
                                {paymentInvoice?.invoice_number}
                            </p>
                            <p>
                                <strong>Total Amount:</strong>{' '}
                                {paymentInvoice &&
                                    formatCurrency(paymentInvoice.amount)}
                            </p>
                            <p className="font-semibold text-red-500">
                                <strong>Balance Due:</strong>{' '}
                                {paymentInvoice &&
                                    formatCurrency(
                                        Number(paymentInvoice.amount) -
                                            (paymentInvoice.payments?.reduce(
                                                (sum, p) =>
                                                    sum + Number(p.amount),
                                                0,
                                            ) || 0),
                                    )}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount Provided</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={payData.amount}
                                onChange={(e) =>
                                    setPayData('amount', e.target.value)
                                }
                            />
                            {payErrors.amount && (
                                <span className="text-xs text-red-500">
                                    {payErrors.amount}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_date">Payment Date</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={payData.payment_date}
                                onChange={(e) =>
                                    setPayData('payment_date', e.target.value)
                                }
                            />
                            {payErrors.payment_date && (
                                <span className="text-xs text-red-500">
                                    {payErrors.payment_date}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reference_number">
                                Reference Number (Optional)
                            </Label>
                            <Input
                                id="reference_number"
                                value={payData.reference_number}
                                onChange={(e) =>
                                    setPayData(
                                        'reference_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. Transaction ID"
                            />
                            {payErrors.reference_number && (
                                <span className="text-xs text-red-500">
                                    {payErrors.reference_number}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={payData.notes}
                                onChange={(e) =>
                                    setPayData('notes', e.target.value)
                                }
                                placeholder="Additional details..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={payProcessing}>
                                Run Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
