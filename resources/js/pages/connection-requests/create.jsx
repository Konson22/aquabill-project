import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, FilePlus2, Loader2, Plus, Trash2 } from 'lucide-react';

const customerTypes = [
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Government', value: 'government' },
];

const emptyItem = () => ({
    description: '',
    amount: '',
    quantity: 1,
});

export default function CreateConnectionRequest({ zones = [], tariffs = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        national_id: '',
        address: '',
        plot_no: '',
        customer_type: 'residential',
        zone_id: '',
        tariff_id: '',
        issued_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [emptyItem()],
    });

    const totalAmount = useMemo(() => {
        return data.items.reduce((sum, item) => {
            const amount = Number(item.amount) || 0;
            const qty = Number(item.quantity) || 1;
            return sum + amount * qty;
        }, 0);
    }, [data.items]);

    const addItem = () => {
        setData('items', [...data.items, emptyItem()]);
    };

    const removeItem = (index) => {
        if (data.items.length <= 1) {
            return;
        }
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateItem = (index, field, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: value };
        setData('items', items);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('connection-requests.store'));
    };

    const breadcrumbs = [
        { title: 'Connection requests', href: route('connection-requests.index') },
        { title: 'New request', href: route('connection-requests.create') },
    ];

    const selectClass =
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New connection request" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1 px-2 text-muted-foreground" asChild>
                        <Link href={route('connection-requests.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <FilePlus2 className="h-6 w-6 text-primary" />
                        New connection request
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Capture applicant details and fee line items before creating a customer account.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Applicant details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (optional)</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="national_id">National ID (optional)</Label>
                                <Input
                                    id="national_id"
                                    value={data.national_id}
                                    onChange={(e) => setData('national_id', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="plot_no">Plot no. (optional)</Label>
                                <Input id="plot_no" value={data.plot_no} onChange={(e) => setData('plot_no', e.target.value)} />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={`${selectClass} min-h-[80px]`}
                                    required
                                />
                                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer_type">Customer type</Label>
                                <select
                                    id="customer_type"
                                    value={data.customer_type}
                                    onChange={(e) => setData('customer_type', e.target.value)}
                                    className={selectClass}
                                >
                                    {customerTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="issued_date">Issued date</Label>
                                <Input
                                    id="issued_date"
                                    type="date"
                                    value={data.issued_date}
                                    onChange={(e) => setData('issued_date', e.target.value)}
                                    required
                                />
                                {errors.issued_date && <p className="text-xs text-red-500">{errors.issued_date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zone_id">Zone</Label>
                                <select
                                    id="zone_id"
                                    value={data.zone_id}
                                    onChange={(e) => setData('zone_id', e.target.value)}
                                    className={selectClass}
                                    required
                                >
                                    <option value="">Select zone...</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.zone_id && <p className="text-xs text-red-500">{errors.zone_id}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tariff_id">Tariff</Label>
                                <select
                                    id="tariff_id"
                                    value={data.tariff_id}
                                    onChange={(e) => setData('tariff_id', e.target.value)}
                                    className={selectClass}
                                    required
                                >
                                    <option value="">Select tariff...</option>
                                    {tariffs.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.tariff_id && <p className="text-xs text-red-500">{errors.tariff_id}</p>}
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={`${selectClass} min-h-[60px]`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Fee line items</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-1 h-4 w-4" />
                                Add line
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                            {data.items.map((item, index) => (
                                <div key={index} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-12">
                                    <div className="grid gap-2 sm:col-span-7">
                                        <Label>Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Fee description"
                                            required
                                        />
                                        {errors[`items.${index}.description`] && (
                                            <p className="text-xs text-red-500">{errors[`items.${index}.description`]}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label>Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.amount}
                                            onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                            required
                                        />
                                        {errors[`items.${index}.amount`] && (
                                            <p className="text-xs text-red-500">{errors[`items.${index}.amount`]}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2 sm:col-span-1">
                                        <Label>Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end justify-end sm:col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length <= 1}
                                            title="Remove line"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end border-t pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Total:{' '}
                                    <span className="font-mono text-lg font-semibold text-foreground">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('connection-requests.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Create request'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
