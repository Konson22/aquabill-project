import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CURRENCY_CODE } from '@/lib/utils';
import { ArrowLeft, CreditCard, Calendar, Loader2 } from 'lucide-react';

/**
 * @param {{ customer: { id: number, name: string, account_number: string, status: string }, serviceChargeTypes?: { id: number, name: string, amount?: string }[] }} props
 */
export default function CreateServiceCharge({ customer, serviceChargeTypes = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        service_charge_type_id: '',
        amount: '',
        issued_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        {
            title: 'Issue service charge',
            href: route('customers.service-charges.create', customer.id),
        },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.service-charges.store', { customer: customer.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue service charge" />

            <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1 px-2 text-muted-foreground" asChild>
                            <Link href="/customers">
                                <ArrowLeft className="h-4 w-4" />
                                Back to customers
                            </Link>
                        </Button>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <CreditCard className="h-6 w-6 text-emerald-600" />
                            Issue service charge
                        </h1>
                        <p className="text-sm text-muted-foreground">Create a new service charge for this customer.</p>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Charge details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Customer</Label>
                                <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-emerald-900">{customer.name}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-700">
                                            Account: {customer.account_number}
                                        </span>
                                    </div>
                                    <Badge variant="outline" className="border-emerald-200 bg-white">
                                        {customer.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="service_charge_type_id">Service charge type</Label>
                                <select
                                    id="service_charge_type_id"
                                    value={data.service_charge_type_id}
                                    onChange={(e) => setData('service_charge_type_id', e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select a charge type...</option>
                                    {serviceChargeTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.service_charge_type_id && (
                                    <p className="text-xs text-red-500">{errors.service_charge_type_id}</p>
                                )}
                            </div>

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
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted-foreground">
                                        {CURRENCY_CODE}
                                    </div>
                                </div>
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="issued_date">Issued date</Label>
                                <div className="relative">
                                    <Input
                                        id="issued_date"
                                        type="date"
                                        value={data.issued_date}
                                        onChange={(e) => setData('issued_date', e.target.value)}
                                    />
                                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                                {errors.issued_date && <p className="text-xs text-red-500">{errors.issued_date}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add any additional notes..."
                                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
                            </div>

                            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/customers">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.service_charge_type_id || !data.amount}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create charge'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
