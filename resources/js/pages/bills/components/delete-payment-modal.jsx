import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';

function formatPaymentDate(value) {
    if (!value) {
        return '—';
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }
    try {
        return new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

export default function DeletePaymentModal({
    open,
    onOpenChange,
    bill,
    payment,
    payments = [],
    onPaymentChange,
}) {
    const billId = bill?.id ?? null;
    const paymentId = payment?.id ?? null;
    const customerName = bill?.customer?.name ?? '—';
    const [processing, setProcessing] = useState(false);

    const hasMultiplePayments = (payments?.length ?? 0) > 1;

    useEffect(() => {
        if (!open) {
            setProcessing(false);
        }
    }, [open]);

    const selectedAmount = useMemo(() => {
        if (!payment) {
            return 0;
        }

        return Number(payment.amount ?? 0);
    }, [payment]);

    const submit = () => {
        if (!billId || !paymentId) {
            return;
        }

        setProcessing(true);
        router.delete(route('bills.payments.destroy', [billId, paymentId]), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                onOpenChange?.(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        Delete payment
                    </DialogTitle>
                    <DialogDescription>
                        {customerName}
                        {payment && (
                            <span className="mt-2 block text-sm text-foreground">
                                Remove payment of{' '}
                                <span className="font-mono font-semibold">
                                    {formatCurrency(selectedAmount)}
                                </span>
                                {payment.payment_date && (
                                    <span className="text-muted-foreground">
                                        {' '}
                                        · {formatPaymentDate(payment.payment_date)}
                                    </span>
                                )}
                                . This will update the bill balance and status.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {hasMultiplePayments && (
                    <div className="space-y-2">
                        <Label>Payment to remove</Label>
                        <Select
                            value={paymentId ? String(paymentId) : ''}
                            onValueChange={(value) => {
                                const selected = payments.find(
                                    (row) => String(row.id) === value,
                                );
                                onPaymentChange?.(selected ?? null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment" />
                            </SelectTrigger>
                            <SelectContent>
                                {payments.map((row) => (
                                    <SelectItem key={row.id} value={String(row.id)}>
                                        {formatPaymentDate(row.payment_date)} ·{' '}
                                        {formatCurrency(row.amount)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange?.(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={submit}
                        disabled={processing || !billId || !paymentId}
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            'Delete payment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
