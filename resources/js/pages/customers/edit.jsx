import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPen, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const customerTypes = [
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Government', value: 'government' },
];

const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export default function EditCustomer({ customer, zones = [], tariffs = [] }) {
    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        { title: customer.name, href: `/customers/${customer.id}` },
        { title: 'Edit', href: `/customers/${customer.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        national_id: customer.national_id || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'residential',
        status: customer.status || 'active',
        zone_id: String(customer.zone_id || ''),
        tariff_id: String(customer.tariff_id || ''),
        connection_date: customer.connection_date || new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${customer.name}`} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <UserPen className="h-6 w-6 text-primary" />
                            Edit Customer Profile
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update personal information, contact details, and billing settings for <span className="font-bold text-foreground">{customer.account_number}</span>.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/customers/${customer.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>Customer Profile</CardTitle>
                            <CardDescription>Basic identity and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter customer name"
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+211..."
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="customer@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="national_id">National ID</Label>
                                <Input
                                    id="national_id"
                                    value={data.national_id}
                                    onChange={(e) => setData('national_id', e.target.value)}
                                    placeholder="Enter ID number"
                                />
                                <InputError message={errors.national_id} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter full address"
                                />
                                <InputError message={errors.address} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>Billing & Connection Settings</CardTitle>
                            <CardDescription>Update customer status and billing parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Customer Type</Label>
                                <Select value={data.customer_type} onValueChange={(value) => setData('customer_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select customer type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customerTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.customer_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Zone</Label>
                                <Select value={data.zone_id} onValueChange={(value) => setData('zone_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones.map((zone) => (
                                            <SelectItem key={zone.id} value={String(zone.id)}>
                                                {zone.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.zone_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Tariff</Label>
                                <Select value={data.tariff_id} onValueChange={(value) => setData('tariff_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tariff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tariffs.map((tariff) => (
                                            <SelectItem key={tariff.id} value={String(tariff.id)}>
                                                {tariff.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.tariff_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="connection_date">Connection Date</Label>
                                <Input
                                    id="connection_date"
                                    type="date"
                                    value={data.connection_date}
                                    onChange={(e) => setData('connection_date', e.target.value)}
                                />
                                <InputError message={errors.connection_date} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/customers/${customer.id}`}>Cancel</Link>
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
