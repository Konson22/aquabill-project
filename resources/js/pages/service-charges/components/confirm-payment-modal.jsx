import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ConfirmPaymentModal({ charge, isOpen, onClose }) {
    const { post, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        post(route('service-charges.confirm-payment', charge.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!charge) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] animate-in fade-in zoom-in duration-300">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-emerald-600 text-xl font-black">
                            <CheckCircle2 className="h-6 w-6" />
                            Confirm Payment
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to mark this service charge as <span className="font-bold text-emerald-600">PAID</span>? 
                            This action will update the status and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Customer:</span>
                                <span className="font-bold">{charge.customer?.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Type:</span>
                                <span className="font-bold">{charge.service_charge_type?.name}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-muted-foreground/10">
                                <span className="text-muted-foreground font-medium text-base">Amount Due:</span>
                                <span className="text-xl font-black text-primary">
                                    {formatCurrency(charge.amount)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p>This will only update the status of this charge. It does not create a formal receipt in the system's payment ledger.</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 font-bold"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Mark Paid
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
