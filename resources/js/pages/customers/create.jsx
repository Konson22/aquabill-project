import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus, Gauge } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    { label: 'Broken', value: 'broken' },
];

export default function CreateCustomer({ zones = [], tariffs = [], existingMeters = [] }) {
    const [meterSetupMode, setMeterSetupMode] = useState('existing');

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

                <form className="space-y-6">
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>Customer Profile</CardTitle>
                            <CardDescription>Basic identity and contact information.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="Enter customer name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="+211..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="customer@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="national_id">National ID</Label>
                                <Input id="national_id" placeholder="Enter ID number" />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" rows={3} placeholder="Enter full address" />
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
                                <Select defaultValue="residential">
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
                            </div>

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select defaultValue="active">
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
                            </div>

                            <div className="grid gap-2">
                                <Label>Zone</Label>
                                <Select>
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
                            </div>

                            <div className="grid gap-2">
                                <Label>Tariff</Label>
                                <Select>
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
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="connection_date">Connection Date</Label>
                                <Input id="connection_date" type="date" />
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
                                    variant={meterSetupMode === 'existing' ? 'default' : 'outline'}
                                    className="justify-start"
                                    onClick={() => setMeterSetupMode('existing')}
                                >
                                    Select Existing Meter
                                </Button>
                                <Button
                                    type="button"
                                    variant={meterSetupMode === 'new' ? 'default' : 'outline'}
                                    className="justify-start"
                                    onClick={() => setMeterSetupMode('new')}
                                >
                                    Add New Meter
                                </Button>
                            </div>

                            {meterSetupMode === 'existing' ? (
                                <div className="grid gap-2">
                                    <Label>Available Meters</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select available meter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {existingMeters.length ? (
                                                existingMeters.map((meter) => (
                                                    <SelectItem key={meter.id} value={String(meter.id)} disabled={Boolean(meter.customer_id)}>
                                                        {meter.meter_number}
                                                        {meter.customer_id ? ` (Assigned to ${meter.customer?.name ?? 'customer'})` : ' (Available)'}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-meters" disabled>
                                                    No meters found in database
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Meters are loaded from database. Assigned meters are shown but disabled.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="new_meter_number">Meter Number</Label>
                                        <Input id="new_meter_number" placeholder="Enter meter number" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Meter Status</Label>
                                        <Select defaultValue="active">
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
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/customers">Cancel</Link>
                        </Button>
                        <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
