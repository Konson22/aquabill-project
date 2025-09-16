import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CreditCard, DollarSign, Loader2, Receipt, Smartphone, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Invoice Payment Form Modal
 *
 * Props:
 * - trigger: ReactNode (optional) custom trigger element; if not provided, shows a default "Add Payment" button
 * - open: boolean (controlled) optional – if provided, component becomes controlled by parent
 * - onOpenChange: (open: boolean) => void (optional) – controlled open change callback
 * - onSubmit: (data) => Promise<void> | void – called with payment data
 * - defaultValues: object (optional) – prefill fields
 * - methods: array (optional) – list of payment methods to show; defaults common items
 */
export default function InvoicePaymentFormModal({
    trigger,
    open: controlledOpen,
    onOpenChange,
    onSubmit,
    defaultValues = {},
    customer = null,
    methods = [
        { value: 'cash', label: 'Cash', icon: Wallet, color: 'bg-green-100 text-green-800' },
        { value: 'card', label: 'Card', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
        { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: 'bg-orange-100 text-orange-800' },
    ],
}) {
    const isControlled = typeof controlledOpen === 'boolean';
    const [internalOpen, setInternalOpen] = useState(false);

    const [formData, setFormData] = useState({
        invoice_id: defaultValues.invoice_id || '',
        customer_id: defaultValues.customer_id || '',
        amount: defaultValues.amount || '',
        method: defaultValues.method || methods[0]?.value || 'cash',
        date: defaultValues.date || new Date().toISOString().split('T')[0],
        reference: defaultValues.reference || '',
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const formatCurrency = (value) => {
        const num = Number(value || 0);
        return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
    };

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            invoice_id: defaultValues.invoice_id || prev.invoice_id,
            customer_id: defaultValues.customer_id || prev.customer_id,
            amount: defaultValues.amount ?? prev.amount,
            method: defaultValues.method || prev.method,
            date: defaultValues.date || prev.date,
            reference_number: defaultValues.reference || prev.reference,
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
            invoice_id: defaultValues.invoice_id || '',
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
        if (!formData.invoice_id) {
            nextErrors.invoice_id = 'Invoice ID is required';
        }
        if (!formData.reference_number) {
            nextErrors.reference_number = 'Reference ID is required';
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
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Invoice Payment
                    </DialogTitle>
                    <DialogDescription>Record payment for invoice #{defaultValues.invoice_id || 'N/A'}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Customer</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {customer ? `${customer.first_name} ${customer.last_name}` : defaultValues.customer_name || 'N/A'}
                                    </div>
                                    {customer?.email && <div className="text-xs text-slate-500">{customer.email}</div>}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Invoice #</div>
                                    <div className="text-sm font-semibold text-slate-900">#{defaultValues.invoice_id || 'N/A'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Amount Due</div>
                                    <div className="text-sm font-semibold text-slate-900">{formatCurrency(defaultValues.amount)}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500">Due Date</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {defaultValues.due_date ? new Date(defaultValues.due_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-900">Payment Details</h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-medium">
                                    Amount Paid <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
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
                                </div>
                                <InputError message={errors.amount} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="method" className="text-sm font-medium">
                                    Payment Method <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.method} onValueChange={(v) => handleChange('method', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {methods.map((m) => {
                                            const IconComponent = m.icon || Wallet;
                                            return (
                                                <SelectItem key={m.value} value={m.value}>
                                                    <div className="flex items-center gap-2">
                                                        <IconComponent className="h-4 w-4" />
                                                        {m.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.method} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-sm font-medium">
                                    Payment Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleChange('date', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference_number" className="text-sm font-medium">
                                    Reference Number
                                </Label>
                                <Input
                                    id="reference_number"
                                    value={formData.reference_number}
                                    onChange={(e) => handleChange('reference_number', e.target.value)}
                                    placeholder="Reference number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[120px]">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Record Payment'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
