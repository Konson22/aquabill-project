import { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { formatCurrency, formatStationAccountantSubtitle } from '@/lib/utils';
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
import { Loader2, Pencil } from 'lucide-react';

function formatPaymentDate(value) {
    if (!value) {
        return '';
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch {
        return '';
    }
}

export default function EditPaymentModal({
    open,
    onOpenChange,
    bill,
    payment,
    payments = [],
    stations = [],
    onPaymentChange,
}) {
    const billId = bill?.id ?? null;
    const paymentId = payment?.id ?? null;
    const customerName = bill?.customer?.name ?? '—';
    const accountNumber = bill?.customer?.account_number ?? '—';
    const billTotal = useMemo(() => Number(bill?.total_amount ?? 0), [bill?.total_amount]);

    const otherPaymentsTotal = useMemo(() => {
        if (!paymentId) {
            return 0;
        }

        return (payments ?? [])
            .filter((row) => row.id !== paymentId)
            .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    }, [payments, paymentId]);

    const maxAmount = useMemo(
        () => Math.max(0, billTotal - otherPaymentsTotal),
        [billTotal, otherPaymentsTotal],
    );

    const form = useForm({
        amount: '',
        payment_date: '',
        payment_method: 'cash',
        reference_number: '',
        notes: '',
        station_id: '',
    });

    useEffect(() => {
        if (!open || !payment) {
            return;
        }

        form.setData({
            amount: String(payment.amount ?? ''),
            payment_date: formatPaymentDate(payment.payment_date),
            payment_method: payment.payment_method ?? 'cash',
            reference_number: payment.reference_number ?? '',
            notes: payment.notes ?? '',
            station_id: payment.station_id ? String(payment.station_id) : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, payment?.id]);

    const paymentAmountEntered = useMemo(() => {
        const raw = form.data.amount;
        if (raw === '' || raw === null || raw === undefined) {
            return 0;
        }
        const value = Number(raw);
        return Number.isFinite(value) ? Math.max(0, value) : 0;
    }, [form.data.amount]);

    const balanceAfterEdit = useMemo(
        () => Math.max(0, billTotal - otherPaymentsTotal - paymentAmountEntered),
        [billTotal, otherPaymentsTotal, paymentAmountEntered],
    );

    const submit = (event) => {
        event.preventDefault();
        if (!billId || !paymentId) {
            return;
        }

        form.patch(route('bills.payments.update', [billId, paymentId]), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange?.(false);
            },
        });
    };

    const hasMultiplePayments = (payments?.length ?? 0) > 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-blue-600" />
                        Edit payment
                    </DialogTitle>
                    <DialogDescription>
                        {customerName} · {accountNumber}
                        <span className="mt-2 block text-sm text-muted-foreground">
                            Bill total {formatCurrency(billTotal)}
                            {hasMultiplePayments && (
                                <>
                                    {' '}
                                    · Other payments on this bill{' '}
                                    {formatCurrency(otherPaymentsTotal)}
                                </>
                            )}
                        </span>
                        <span className="mt-2 block text-red-500 text-xl">
                            Balance after this payment{' '}
                            <span className="font-mono font-semibold">
                                {formatCurrency(balanceAfterEdit)}
                            </span>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {hasMultiplePayments && (
                        <div className="space-y-2">
                            <Label>Payment to edit</Label>
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit_payment_amount">Amount</Label>
                            <Input
                                id="edit_payment_amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxAmount > 0 ? maxAmount : undefined}
                                value={form.data.amount}
                                onChange={(event) =>
                                    form.setData('amount', event.target.value)
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum {formatCurrency(maxAmount)} for this line.
                            </p>
                            {form.errors.amount && (
                                <p className="text-sm text-destructive">{form.errors.amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_payment_date">Payment date</Label>
                            <Input
                                id="edit_payment_date"
                                type="date"
                                value={form.data.payment_date}
                                onChange={(event) =>
                                    form.setData('payment_date', event.target.value)
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
                                onValueChange={(value) =>
                                    form.setData('payment_method', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">Bank deposit</SelectItem>
                                    <SelectItem value="mobile_money">Mobile money</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.payment_method && (
                                <p className="text-sm text-destructive">
                                    {form.errors.payment_method}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_reference_number">Reference (optional)</Label>
                            <Input
                                id="edit_reference_number"
                                value={form.data.reference_number}
                                onChange={(event) =>
                                    form.setData('reference_number', event.target.value)
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

                    {stations.length > 0 && (
                        <div className="space-y-2">
                            <Label>Collection station</Label>
                            <Select
                                value={String(form.data.station_id ?? '')}
                                onValueChange={(value) => form.setData('station_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select station" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stations.map((station) => (
                                        <SelectItem key={station.id} value={String(station.id)}>
                                            <span className="flex flex-col">
                                                <span>{station.name}</span>
                                                {formatStationAccountantSubtitle(station) && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatStationAccountantSubtitle(station)}
                                                    </span>
                                                )}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.station_id && (
                                <p className="text-sm text-destructive">{form.errors.station_id}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="edit_payment_notes">Notes (optional)</Label>
                        <Textarea
                            id="edit_payment_notes"
                            value={form.data.notes}
                            onChange={(event) => form.setData('notes', event.target.value)}
                            placeholder="Any extra context for this payment"
                        />
                        {form.errors.notes && (
                            <p className="text-sm text-destructive">{form.errors.notes}</p>
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
                        <Button type="submit" disabled={form.processing || !billId || !paymentId}>
                            {form.processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
