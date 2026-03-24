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
import { CreditCard, Eye, Pencil, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function BillsTab({ allBills, canEdit = true }) {
    const [deleteId, setDeleteId] = useState(null);
    const [payOpen, setPayOpen] = useState(false);
    const [paymentBill, setPaymentBill] = useState(null);

    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: payProcessing,
        errors: payErrors,
        reset: resetPay,
    } = useForm({
        bill_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    const getBillTotal = (bill) => {
        if (!bill) return 0;
        const total =
            bill.total_amount ??
            Number(bill.amount) + Number(bill.previous_balance ?? 0);
        return Number(total);
    };

    const getBillBalance = (bill) => {
        if (!bill) return 0;
        const total = getBillTotal(bill);
        const paid = Number(bill.amount_paid ?? 0);
        return Math.max(0, total - paid);
    };

    const handlePayClick = (bill) => {
        setPaymentBill(bill);
        const balance = getBillBalance(bill);
        setPayData({
            bill_id: bill.id,
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
                setPaymentBill(null);
            },
        });
    };

    const canDelete = (bill) =>
        ![
            'fully paid',
            'forwarded',
            'partial paid',
            'balance forwarded',
        ].includes(bill.status);

    const handleDelete = (id) => {
        router.delete(route('bills.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Receipt className="h-4 w-4" />
                    All Bills
                </h2>
            </div>
            {allBills.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Bill Number</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead className="text-right">
                                    Prev. Balance
                                </TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                                <TableHead className="text-right">
                                    Total Due
                                </TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[140px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allBills.map((bill) => (
                                <TableRow
                                    key={bill.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-medium">
                                        {bill.bill_number}
                                    </TableCell>
                                    <TableCell>{bill.home_address}</TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(
                                            bill.previous_balance ?? 0,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(bill.amount)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(getBillTotal(bill))}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            bill.created_at,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                bill.status === 'fully paid'
                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                    : bill.status ===
                                                            'pending' ||
                                                        new Date(
                                                            bill.due_date,
                                                        ) < new Date()
                                                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                                                      : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                            }`}
                                        >
                                            {bill.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'bills.show',
                                                        bill.id,
                                                    )}
                                                    title="View"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {[
                                                'pending',
                                                'partial paid',
                                            ].includes(bill.status) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        handlePayClick(bill)
                                                    }
                                                    title="Pay"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canEdit &&
                                                (bill.status === 'pending' ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        asChild
                                                        title="Edit"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'bills.show',
                                                                bill.id,
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
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        setDeleteId(bill.id)
                                                    }
                                                    disabled={!canDelete(bill)}
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
                    <Receipt className="mb-4 h-10 w-10 opacity-20" />
                    <p>No bills found for this customer.</p>
                </div>
            )}

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Enter payment details for bill{' '}
                            <span className="font-mono font-medium text-foreground">
                                {paymentBill?.bill_number ?? paymentBill?.id}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitPayment} className="space-y-4">
                        {paymentBill && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Total Amount:
                                        </span>
                                        <div className="font-medium">
                                            {formatCurrency(
                                                getBillTotal(paymentBill),
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
                                                    getBillBalance(
                                                        paymentBill,
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
                                    <Label htmlFor="pay-amount">
                                        Amount Provided
                                    </Label>
                                    <Input
                                        id="pay-amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={
                                            paymentBill
                                                ? getBillBalance(paymentBill)
                                                : undefined
                                        }
                                        value={payData.amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const maxVal = paymentBill
                                                ? getBillBalance(paymentBill)
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
                                    <Label htmlFor="pay-date">
                                        Payment Date
                                    </Label>
                                    <Input
                                        id="pay-date"
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
                                <Label htmlFor="pay-reference">
                                    Reference Number{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pay-reference"
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
                                <Label htmlFor="pay-notes">
                                    Notes{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="pay-notes"
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
                        <AlertDialogTitle>Delete bill?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The bill will be
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
