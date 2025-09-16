import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign, Loader2, Smartphone, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Enhanced Payment Form Modal
 *
 * Props:
 * - trigger: ReactNode (optional) custom trigger element; if not provided, shows a default "Add Payment" button
 * - open: boolean (controlled) optional – if provided, component becomes controlled by parent
 * - onOpenChange: (open: boolean) => void (optional) – controlled open change callback
 * - onSubmit: (data) => Promise<void> | void – called with payment data
 * - defaultValues: object (optional) – prefill fields
 * - methods: array (optional) – list of payment methods to show; defaults common items
 */
export default function PaymentFormModal({
    trigger,
    open: controlledOpen,
    onOpenChange,
    onSubmit,
    defaultValues = {},
    methods = [
        { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
        { value: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
        { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
    ],
}) {
    const isControlled = typeof controlledOpen === 'boolean';
    const [internalOpen, setInternalOpen] = useState(false);

    const [formData, setFormData] = useState({
        bill_id: defaultValues.bill_id || '',
        customer_id: defaultValues.customer_id || '',
        amount: defaultValues.amount || '',
        method: defaultValues.method || methods[0]?.value || 'cash',
        date: defaultValues.date || new Date().toISOString().split('T')[0],
        reference_number: defaultValues.reference_number || '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const formatCurrency = (value) => {
        const num = Number(value || 0);
        return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
    };

    // Calculate total due including illegal connection
    const totalDue = Number(defaultValues.total_amount || 0);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            bill_id: defaultValues.bill_id || prev.bill_id,
            customer_id: defaultValues.customer_id || prev.customer_id,
            amount: totalDue ?? prev.amount,
            method: defaultValues.method || prev.method,
            date: defaultValues.date || prev.date,
            reference_number: defaultValues.reference_number || prev.reference_number,
        }));
    }, [defaultValues]);

    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (next) => {
        if (isControlled) {
            onOpenChange && onOpenChange(next);
        } else {
            setInternalOpen(next);
        }
        if (!next) {
            resetForm();
        }
    };

    const resetForm = () => {
        setErrors({});
        setFormData({
            bill_id: defaultValues.bill_id || '',
            customer_id: defaultValues.customer_id || '',
            amount: defaultValues.amount || '',
            method: defaultValues.method || methods[0]?.value || 'cash',
            date: defaultValues.date || new Date().toISOString().split('T')[0],
            reference_number: defaultValues.reference_number || '',
        });
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!formData.amount || Number(formData.amount) <= 0) {
            nextErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.method) {
            nextErrors.method = 'Select a payment method';
        }
        if (!formData.date) {
            nextErrors.date = 'Select a payment date';
        }
        if (formData.reference_number && formData.reference_number.trim().length === 0) {
            nextErrors.reference_number = 'Reference number cannot be empty';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setSubmitting(true);
            await Promise.resolve(onSubmit && onSubmit({ ...formData }));
            setOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button className="gap-2">
                            <DollarSign className="h-4 w-4" />
                            Add Payment
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="flex max-h-[85vh] max-w-[700px] flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>Capture a payment against a bill or customer account</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col space-y-4">
                    {/* Compact Bill Summary */}
                    <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-slate-500">Customer</div>
                                <div className="text-sm font-medium">{defaultValues.customer_name || formData.customer_id || '—'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">Total Due</div>
                                <div className="text-lg font-semibold text-slate-900">{formatCurrency(totalDue)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-xs text-slate-500">Previous Balance</div>
                                <div className="text-sm font-medium">{formatCurrency(defaultValues.prev_balance)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Current Bill</div>
                                <div className="text-sm font-medium">{formatCurrency(defaultValues.total_amount)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Remaining</div>
                                <div className="text-sm font-medium text-red-600">{formatCurrency(totalDue - formData.amount)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {/* Left Column - Amount and Method */}
                        <div className="flex-1">
                            <Label htmlFor="amount" className="text-sm font-medium">
                                Amount Paid <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference_number" className="text-sm font-medium">
                                Reference Number
                            </Label>
                            <Input
                                id="reference_number"
                                type="text"
                                value={formData.reference_number}
                                onChange={(e) => handleChange('reference_number', e.target.value)}
                                placeholder="Enter reference number"
                            />
                            <InputError message={errors.reference_number} />
                        </div>
                    </div>

                    <div className="">
                        <Label className="text-sm font-medium">Quick Select</Label>
                        <div className="flex items-center space-x-2">
                            {methods.slice(0, 4).map((m) => {
                                const IconComponent = m.icon || Wallet;
                                const isSelected = formData.method === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => handleChange('method', m.value)}
                                        className={`flex flex-1 items-center gap-2 rounded-md border p-2 transition-colors ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700'
                                        }`}
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        <span className="text-xs">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 border-t border-slate-200 pt-2 dark:border-slate-700">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[120px]">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Payment'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
