import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CURRENCY_CODE } from '@/lib/utils';
import { CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export default function ServiceChargeModal({ customer, serviceChargeTypes = [], isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        service_charge_type_id: '',
        amount: '',
        issued_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                service_charge_type_id: '',
                amount: '',
                issued_date: new Date().toISOString().split('T')[0],
                notes: '',
            });
            clearErrors();
        }
    }, [isOpen]);

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.service-charges.store', { customer: customer.id }), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-emerald-500" />
                            Issue Service Charge
                        </DialogTitle>
                        <DialogDescription>
                            Create a new service charge for {customer.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Customer Info */}
                        <div className="grid gap-2">
                            <Label>Customer</Label>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/50 border-emerald-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-emerald-900">{customer.name}</span>
                                    <span className="text-[10px] text-emerald-700 uppercase font-black tracking-tighter">
                                        Account: {customer.account_number}
                                    </span>
                                </div>
                                <Badge variant="outline" className="bg-white border-emerald-200">{customer.status}</Badge>
                            </div>
                        </div>

                        {/* Service Charge Type */}
                        <div className="grid gap-2">
                            <Label htmlFor="service_charge_type_id">Service Charge Type</Label>
                            <select
                                id="service_charge_type_id"
                                value={data.service_charge_type_id}
                                onChange={(e) => setData('service_charge_type_id', e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select a charge type...</option>
                                {serviceChargeTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.service_charge_type_id && <p className="text-xs text-red-500">{errors.service_charge_type_id}</p>}
                        </div>

                        {/* Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (SSP)</Label>
                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="Enter amount..."
                                    className="pr-10"
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                                    {CURRENCY_CODE}
                                </div>
                            </div>
                            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                        </div>

                        {/* Issued Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="issued_date">Issued Date</Label>
                            <div className="relative">
                                <Input
                                    id="issued_date"
                                    type="date"
                                    value={data.issued_date}
                                    onChange={(e) => setData('issued_date', e.target.value)}
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {errors.issued_date && <p className="text-xs text-red-500">{errors.issued_date}</p>}
                        </div>

                        {/* Notes */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Add any additional notes..."
                                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
                        </div>

                        {/* Info Alert */}
                        <Alert className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-[10px]">
                                The charge will be created with "Unpaid" status and can be invoiced later.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.service_charge_type_id || !data.amount} className="bg-emerald-600 hover:bg-emerald-700">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Charge'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
