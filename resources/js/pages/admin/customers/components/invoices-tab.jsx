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
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { Link, router, useForm } from '@inertiajs/react';
import {
    CreditCard,
    Eye,
    FileText,
    Pencil,
    Printer,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

export default function InvoicesTab({
    allInvoices,
    canEdit = true,
}) {
    const [deleteId, setDeleteId] = useState(null);
    const [payOpen, setPayOpen] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);

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

    const getInvoiceBalance = (inv) => {
        if (!inv) return 0;
        const total = Number(inv.amount);
        const paid =
            inv.payments?.reduce((s, p) => s + Number(p.amount), 0) ||
            Number(inv.amount_paid ?? 0);
        return Math.max(0, total - paid);
    };

    const handlePayClick = (invoice) => {
        setPaymentInvoice(invoice);
        const balance = getInvoiceBalance(invoice);
        setPayData({
            invoice_id: invoice.id,
            amount: balance > 0 ? String(balance) : '',
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

    const handleDelete = (id) => {
        router.delete(route('invoices.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <FileText className="h-4 w-4" />
                    All Invoices
                </h2>
            </div>
            {allInvoices.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Invoice Number</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[140px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allInvoices.map((invoice) => (
                                <TableRow
                                    key={invoice.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium">
                                        {invoice.invoice_number}
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(invoice.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            invoice.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                invoice.status === 'paid'
                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                    : invoice.status ===
                                                        'cancelled'
                                                      ? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                                      : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}
                                        >
                                            {invoice.status
                                                ?.charAt(0)
                                                .toUpperCase() +
                                                invoice.status?.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                                title="View"
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
                                            {invoice.status !== 'paid' &&
                                                invoice.status !==
                                                    'cancelled' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            handlePayClick(
                                                                invoice,
                                                            )
                                                        }
                                                        title="Pay"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            {canEdit &&
                                                (invoice.status ===
                                                'pending' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        asChild
                                                        title="Edit"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'invoices.show',
                                                                invoice.id,
                                                            )}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-50"
                                                        disabled
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                ))}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                                title="Print"
                                            >
                                                <a
                                                    href={route(
                                                        'invoices.print',
                                                        invoice.id,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        setDeleteId(invoice.id)
                                                    }
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <FileText className="mb-4 h-10 w-10 opacity-20" />
                    <p>No invoices found for this customer.</p>
                </div>
            )}

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Enter payment details for invoice{' '}
                            <span className="font-mono font-medium text-foreground">
                                {paymentInvoice?.invoice_number ??
                                    paymentInvoice?.id}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitPayment} className="space-y-4">
                        {paymentInvoice && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Invoice Amount:
                                        </span>
                                        <div className="font-medium">
                                            {formatCurrency(
                                                paymentInvoice.amount,
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Outstanding Balance:
                                        </span>
                                        <div className="font-bold text-red-600">
                                            {formatCurrency(
                                                Math.max(
                                                    0,
                                                    getInvoiceBalance(
                                                        paymentInvoice,
                                                    ) -
                                                        (parseFloat(
                                                            payData.amount,
                                                        ) || 0),
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="inv-pay-amount">
                                        Amount Provided
                                    </Label>
                                    <Input
                                        id="inv-pay-amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={
                                            paymentInvoice
                                                ? getInvoiceBalance(
                                                      paymentInvoice,
                                                  )
                                                : undefined
                                        }
                                        value={payData.amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const maxVal = paymentInvoice
                                                ? getInvoiceBalance(
                                                      paymentInvoice,
                                                  )
                                                : 0;
                                            if (
                                                val !== '' &&
                                                parseFloat(val) > maxVal
                                            ) {
                                                setPayData(
                                                    'amount',
                                                    String(maxVal),
                                                );
                                            } else {
                                                setPayData('amount', val);
                                            }
                                        }}
                                        required
                                    />
                                    {payErrors.amount && (
                                        <p className="text-xs text-destructive">
                                            {payErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="inv-pay-date">
                                        Payment Date
                                    </Label>
                                    <Input
                                        id="inv-pay-date"
                                        type="date"
                                        value={payData.payment_date}
                                        onChange={(e) =>
                                            setPayData(
                                                'payment_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {payErrors.payment_date && (
                                        <p className="text-xs text-destructive">
                                            {payErrors.payment_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="inv-pay-reference">
                                    Reference Number{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="inv-pay-reference"
                                    value={payData.reference_number}
                                    onChange={(e) =>
                                        setPayData(
                                            'reference_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Transaction ID, Receipt No."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="inv-pay-notes">
                                    Notes{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="inv-pay-notes"
                                    value={payData.notes}
                                    onChange={(e) =>
                                        setPayData('notes', e.target.value)
                                    }
                                    placeholder="Any additional comments..."
                                    className="h-20 resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPayOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={payProcessing}>
                                {payProcessing
                                    ? 'Processing...'
                                    : 'Confirm Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The invoice will be
                            permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
