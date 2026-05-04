import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus, Gauge, Loader2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

const breadcrumbs = [
    { title: 'Customers', href: '/customers' },
    { title: 'New Customer', href: '/customers/create' },
];

const customerTypes = [
    { label: 'Residential', value: 'residential' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Government', value: 'government' },
];

const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const meterStatuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Damage', value: 'damage' },
];

export default function CreateCustomer({ zones = [], tariffs = [], existingMeters = [], serviceChargeTypes = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        national_id: '',
        address: '',
        plot_no: '',
        customer_type: 'residential',
        status: 'active',
        zone_id: '',
        tariff_id: '',
        connection_date: new Date().toISOString().split('T')[0],
        meter_setup_mode: 'existing', // 'existing', 'new', 'none'
        existing_meter_id: '',
        new_meter_number: '',
        new_meter_status: 'active',
        apply_service_charge: false,
        service_charge_type_id: '',
        service_charge_amount: '',
    });

    const availableMeters = existingMeters.filter((meter) => !meter.customer_id);

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <UserPlus className="h-6 w-6 text-primary" />
                            Create Customer
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Register a new customer account and configure connection details.
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/customers">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Customers
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
                            <div className="grid gap-2">
                                <Label htmlFor="plot_no">Plot number</Label>
                                <Input
                                    id="plot_no"
                                    value={data.plot_no}
                                    onChange={(e) => setData('plot_no', e.target.value)}
                                    placeholder="e.g. 12A"
                                />
                                <InputError message={errors.plot_no} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>Billing & Connection</CardTitle>
                            <CardDescription>Assign type, zone, tariff, and activation details.</CardDescription>
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
                                        {zones.length ? (
                                            zones.map((zone) => (
                                                <SelectItem key={zone.id} value={String(zone.id)}>
                                                    {zone.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-zones" disabled>
                                                No zones loaded
                                            </SelectItem>
                                        )}
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
                                        {tariffs.length ? (
                                            tariffs.map((tariff) => (
                                                <SelectItem key={tariff.id} value={String(tariff.id)}>
                                                    {tariff.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-tariffs" disabled>
                                                No tariffs loaded
                                            </SelectItem>
                                        )}
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

                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gauge className="h-5 w-5 text-muted-foreground" />
                                Meter Setup (Optional)
                            </CardTitle>
                            <CardDescription>Either assign an available meter or register a new one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <Button
                                    type="button"
                                    variant={data.meter_setup_mode === 'existing' ? 'default' : 'outline'}
                                    className="justify-start"
                                    onClick={() => setData('meter_setup_mode', 'existing')}
                                >
                                    Select Existing Meter
                                </Button>
                                <Button
                                    type="button"
                                    variant={data.meter_setup_mode === 'new' ? 'default' : 'outline'}
                                    className="justify-start"
                                    onClick={() => setData('meter_setup_mode', 'new')}
                                >
                                    Add New Meter
                                </Button>
                            </div>

                            {data.meter_setup_mode === 'existing' ? (
                                <div className="grid gap-2">
                                    <Label>Available Meters</Label>
                                    <Select value={data.existing_meter_id} onValueChange={(value) => setData('existing_meter_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select available meter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableMeters.length ? (
                                                availableMeters.map((meter) => (
                                                    <SelectItem key={meter.id} value={String(meter.id)}>
                                                        {meter.meter_number}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-meters" disabled>
                                                    No unassigned meters available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.existing_meter_id} />
                                    <p className="text-xs text-muted-foreground">
                                        Only meters not linked to a customer are listed.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="new_meter_number">Meter Number</Label>
                                        <Input
                                            id="new_meter_number"
                                            value={data.new_meter_number}
                                            onChange={(e) => setData('new_meter_number', e.target.value)}
                                            placeholder="Enter meter number"
                                        />
                                        <InputError message={errors.new_meter_number} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Meter Status</Label>
                                        <Select value={data.new_meter_status} onValueChange={(value) => setData('new_meter_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select meter status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {meterStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.new_meter_status} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Save className="h-5 w-5 text-muted-foreground" />
                                Service Fee Setup (Optional)
                            </CardTitle>
                            <CardDescription>Apply an initial service fee (e.g., Connection Fee, Deposit).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="apply_service_charge"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={data.apply_service_charge}
                                    onChange={(e) => setData('apply_service_charge', e.target.checked)}
                                />
                                <Label htmlFor="apply_service_charge" className="font-bold">Apply initial service charge</Label>
                            </div>

                            {data.apply_service_charge && (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Charge Type</Label>
                                        <Select
                                            value={data.service_charge_type_id}
                                            onValueChange={(value) => {
                                                const type = serviceChargeTypes.find((t) => String(t.id) === value);
                                                setData((prev) => ({
                                                    ...prev,
                                                    service_charge_type_id: value,
                                                    service_charge_amount: type?.amount ?? '',
                                                }));
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select charge type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceChargeTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        {`${type.name} (${formatCurrency(type.amount)})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.service_charge_type_id} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="service_charge_amount">Amount (SSP)</Label>
                                        <Input
                                            id="service_charge_amount"
                                            type="number"
                                            value={data.service_charge_amount}
                                            onChange={(e) => setData('service_charge_amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        <InputError message={errors.service_charge_amount} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/customers">Cancel</Link>
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
