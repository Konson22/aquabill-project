import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency, formatStationAccountantSubtitle } from '@/lib/utils';

export default function ConfirmPaymentModal({ charge, stations = [], isOpen, onClose }) {
    const form = useForm({
        payment_method: 'cash',
        reference_number: '',
        notes: '',
        station_id: '',
    });

    useEffect(() => {
        if (!isOpen || stations.length === 0) {
            return;
        }
        form.setData('station_id', String(stations[0].id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, charge?.id, stations]);

    const submit = (e) => {
        e.preventDefault();
        form.post(route('service-charges.confirm-payment', charge.id), {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    if (!charge) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="animate-in fade-in zoom-in duration-300 sm:max-w-[450px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                            Confirm Payment
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to mark this service charge as{' '}
                            <span className="font-bold text-emerald-600">PAID</span>? This action will update the status
                            and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-6">
                        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-muted-foreground">Customer:</span>
                                <span className="font-bold">{charge.customer?.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-muted-foreground">Type:</span>
                                <span className="font-bold">{charge.service_charge_type?.name}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-muted-foreground/10 pt-2">
                                <span className="text-base font-medium text-muted-foreground">Amount Due:</span>
                                <span className="text-xl font-black text-primary">{formatCurrency(charge.total_due ?? charge.amount)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment method</Label>
                            <Select
                                value={form.data.payment_method}
                                onValueChange={(v) => form.setData('payment_method', v)}
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
                                <p className="text-sm text-destructive">{form.errors.payment_method}</p>
                            )}
                        </div>

                        {stations.length > 0 ? (
                            <div className="space-y-2">
                                <Label>Collection station</Label>
                                <p className="text-xs text-muted-foreground">
                                    Required while you have at least one station configured.
                                </p>
                                <Select
                                    value={String(form.data.station_id)}
                                    onValueChange={(v) => form.setData('station_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select station" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stations.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                <span className="block">{s.name}</span>
                                                {formatStationAccountantSubtitle(s) ? (
                                                    <span className="block text-xs font-normal text-muted-foreground">
                                                        Accountant: {formatStationAccountantSubtitle(s)}
                                                    </span>
                                                ) : null}
                                                {(s.manager_name || s.manager_phone) ? (
                                                    <span className="block text-xs font-normal text-muted-foreground">
                                                        Manager: {s.manager_name || '—'}
                                                        {s.manager_phone ? ` · ${s.manager_phone}` : ''}
                                                    </span>
                                                ) : null}
                                                {s.coordinate ? (
                                                    <span className="block text-xs font-normal text-muted-foreground">
                                                        {s.coordinate}
                                                    </span>
                                                ) : null}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.station_id && (
                                    <p className="text-sm text-destructive">{form.errors.station_id}</p>
                                )}
                            </div>
                        ) : null}

                        <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-[11px] text-amber-600">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>
                                This updates the charge status and records a payment in the ledger.
                                {stations.length > 0
                                    ? ' Select the collection station where payment was received.'
                                    : ' Add stations under Admin → Collection stations to tag payments by desk.'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-emerald-600 font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                        >
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Mark Paid
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
