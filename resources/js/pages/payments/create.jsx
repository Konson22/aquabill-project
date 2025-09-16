import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs = [
    { title: 'Payments', href: '/payments' },
    { title: 'Create Payment', href: '/payments/create' },
];

export default function CreatePaymentPage({ bills = [], customers = [], errors = {} }) {
    const { data, setData, post, processing, reset } = useForm({
        customer_id: '',
        bill_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount_paid: '',
        payment_method: 'cash',
        reference_number: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/payments', { onFinish: () => reset('amount_paid') });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Payment" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Record Payment</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Record a payment against a customer's bill</p>
                </div>
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>

            <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Select the bill and enter payment details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Customer</Label>
                                    <Select value={data.customer_id} onValueChange={(v) => setData('customer_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.first_name} {c.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.customer_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Bill</Label>
                                    <Select value={data.bill_id} onValueChange={(v) => setData('bill_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bill" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bills.map((b) => (
                                                <SelectItem key={b.id} value={String(b.id)}>
                                                    Bill #{b.id} — {b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : 'Unknown'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.bill_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Payment Date</Label>
                                    <Input type="date" value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} />
                                    <InputError message={errors.payment_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount Paid</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                    />
                                    <InputError message={errors.amount_paid} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Method</Label>
                                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.payment_method} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Reference Number</Label>
                                    <Input
                                        type="text"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="Enter reference number"
                                    />
                                    <InputError message={errors.reference_number} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button type="submit" className="w-full" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Payment'}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={() => window.history.back()} disabled={processing}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
