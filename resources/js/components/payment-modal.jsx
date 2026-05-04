import { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { formatCurrency } from '@/lib/utils';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

export default function PaymentModal({ open, onOpenChange, bill }) {
    const billId = bill?.id ?? null;
    const customerName = bill?.customer?.name ?? '—';
    const accountNumber = bill?.customer?.account_number ?? '—';
    const totalAmount = useMemo(
        () => Number(bill?.total_amount ?? 0),
        [bill?.total_amount],
    );

    const amountPaid = useMemo(() => {
        if (bill?.amount_paid != null && bill.amount_paid !== '') {
            return Number(bill.amount_paid);
        }
        return 0;
    }, [bill?.amount_paid]);

    const balanceDue = useMemo(
        () => Math.max(0, totalAmount - amountPaid),
        [totalAmount, amountPaid],
    );

    const form = useForm({
        amount: balanceDue || '',
        payment_date: todayIsoDate(),
        payment_method: 'cash',
        reference_number: '',
        notes: billId ? `Payment for bill #${billId}` : '',
    });

    useEffect(() => {
        if (!open) return;

        form.setData((data) => ({
            ...data,
            amount: balanceDue || '',
            payment_date: todayIsoDate(),
            notes: billId ? `Payment for bill #${billId}` : data.notes,
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, billId, balanceDue]);

    const paymentAmountEntered = useMemo(() => {
        const raw = form.data.amount;
        if (raw === '' || raw === null || raw === undefined) {
            return 0;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) {
            return 0;
        }
        return Math.max(0, n);
    }, [form.data.amount]);

    const balanceAfterThisPayment = useMemo(
        () => Math.max(0, balanceDue - paymentAmountEntered),
        [balanceDue, paymentAmountEntered],
    );

    const submit = (e) => {
        e.preventDefault();
        if (!billId) return;

        form.post(route('bills.payments.store', billId), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange?.(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Record payment</DialogTitle>
                    <DialogDescription>
                        {customerName} · {accountNumber}
                        <span className="mt-2 block text-red-500 text-xl">
                            Balance after this payment{' '}
                            <span className="font-mono font-semibold">
                                {formatCurrency(balanceAfterThisPayment)}
                            </span>
                        </span>
                        <span className="mt-1 block text-muted-foreground text-xs font-normal">
                            Outstanding before payment{' '}
                            <span className="font-mono font-medium text-foreground">
                                {formatCurrency(balanceDue)}
                            </span>
                            {amountPaid > 0 && (
                                <>
                                    {' '}
                                    · Already paid {formatCurrency(amountPaid)}{' '}
                                    of {formatCurrency(totalAmount)}
                                </>
                            )}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.amount}
                                onChange={(e) =>
                                    form.setData('amount', e.target.value)
                                }
                                required
                            />
                            {form.errors.amount && (
                                <p className="text-sm text-destructive">
                                    {form.errors.amount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_date">Payment date</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={form.data.payment_date}
                                onChange={(e) =>
                                    form.setData(
                                        'payment_date',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            {form.errors.payment_date && (
                                <p className="text-sm text-destructive">
                                    {form.errors.payment_date}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Payment method</Label>
                            <Select
                                value={form.data.payment_method}
                                onValueChange={(v) =>
                                    form.setData('payment_method', v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">
                                        Bank deposit
                                    </SelectItem>
                                    <SelectItem value="mobile_money">
                                        Mobile money
                                    </SelectItem>
                                    <SelectItem value="cheque">
                                        Cheque
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.payment_method && (
                                <p className="text-sm text-destructive">
                                    {form.errors.payment_method}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_number">
                                Reference (optional)
                            </Label>
                            <Input
                                id="reference_number"
                                value={form.data.reference_number}
                                onChange={(e) =>
                                    form.setData(
                                        'reference_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="Receipt / transaction ID"
                            />
                            {form.errors.reference_number && (
                                <p className="text-sm text-destructive">
                                    {form.errors.reference_number}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            placeholder="Any extra context for this payment"
                        />
                        {form.errors.notes && (
                            <p className="text-sm text-destructive">
                                {form.errors.notes}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange?.(false)}
                            disabled={form.processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing || !billId}>
                            {form.processing ? 'Saving…' : 'Save payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

