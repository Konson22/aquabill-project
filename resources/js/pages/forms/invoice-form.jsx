import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InvoiceForm({
    invoice = null,
    customers = [],
    meters = [],
    isEditing = false,
    onSuccess,
    selectedCustomer: initialSelectedCustomer = null,
}) {
    const [selectedCustomer, setSelectedCustomer] = useState(initialSelectedCustomer);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Customer selection
        customer_id: invoice?.customer_id || initialSelectedCustomer?.id || '',

        // Invoice details
        reason: invoice?.reason || '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
        amount_due: invoice?.amount_due || '',
        status: 'pending',
    });

    // Handle initial selected customer
    useEffect(() => {
        if (initialSelectedCustomer && !selectedCustomer) {
            setSelectedCustomer(initialSelectedCustomer);
            setData('customer_id', initialSelectedCustomer.id.toString());
        }
    }, [initialSelectedCustomer]);

    // Auto-set due date when issue date changes
    useEffect(() => {
        if (data.issue_date && !data.due_date) {
            const dueDate = new Date(data.issue_date);
            dueDate.setDate(dueDate.getDate() + 30); // 30 days from issue date
            setData('due_date', dueDate.toISOString().split('T')[0]);
        }
    }, [data.issue_date]);

    const handleCustomerChange = (customerId) => {
        setData('customer_id', customerId);
        const customer = customers.find((c) => c.id == customerId);
        setSelectedCustomer(customer);
    };

    const handleIssueDateChange = (date) => {
        setData('issue_date', date);
        if (date) {
            const dueDate = new Date(date);
            dueDate.setDate(dueDate.getDate() + 30);
            setData('due_date', dueDate.toISOString().split('T')[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const submitData = {
            ...data,
            amount_due: parseFloat(data.amount_due) || 0,
        };

        if (isEditing) {
            put(route('invoices.update', invoice.id), {
                data: submitData,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        } else {
            post(route('invoices.store'), {
                data: submitData,
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            });
        }
    };

    const handleReset = () => {
        reset();
        setSelectedCustomer(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Display */}
            <div>
                <Label className="text-sm font-medium">Customer</Label>
                {selectedCustomer ? (
                    <div className="mt-1 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {selectedCustomer.first_name} {selectedCustomer.last_name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-1 rounded-md border border-dashed border-gray-300 p-2 text-center text-sm text-gray-500">
                        No customer selected
                    </div>
                )}
            </div>

            {/* Dates and Amount */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <Label htmlFor="issue_date" className="text-sm font-medium">
                        Issue Date *
                    </Label>
                    <Input
                        id="issue_date"
                        type="date"
                        value={data.issue_date}
                        onChange={(e) => handleIssueDateChange(e.target.value)}
                        className="mt-1 h-9"
                    />
                    <InputError message={errors.issue_date} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="due_date" className="text-sm font-medium">
                        Due Date *
                    </Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className="mt-1 h-9"
                    />
                    <InputError message={errors.due_date} className="mt-1" />
                </div>

                <div>
                    <Label htmlFor="amount_due" className="text-sm font-medium">
                        Amount (SSP) *
                    </Label>
                    <Input
                        id="amount_due"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.amount_due}
                        onChange={(e) => setData('amount_due', e.target.value)}
                        placeholder="0.00"
                        className="mt-1 h-9"
                    />
                    <InputError message={errors.amount_due} className="mt-1" />
                </div>
            </div>

            {/* Reason */}
            <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                    Reason (Optional)
                </Label>
                <Textarea
                    id="reason"
                    value={data.reason}
                    onChange={(e) => setData('reason', e.target.value)}
                    placeholder="Enter reason for this invoice..."
                    className="mt-1 min-h-[60px]"
                    rows={2}
                />
                <InputError message={errors.reason} className="mt-1" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleReset} disabled={processing} size="sm">
                    Reset
                </Button>
                <Button type="submit" disabled={processing} size="sm" className="min-w-[100px]">
                    <Save className="mr-2 h-4 w-4" />
                    {processing ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
