import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CustomerEdit({
    customer,
    zones = [],
    areas = [],
    tariffs = [],
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        plot_number: customer.plot_number || '',
        zone_id: customer.zone_id?.toString() || '',
        area_id: customer.area_id?.toString() || '',
        tariff_id: customer.tariff_id?.toString() || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Customers', href: route('customers.index') },
                { title: 'Edit', href: route('customers.edit', customer.id) },
            ]}
        >
            <Head title="Edit Customer" />

            <div className="pb-14">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Customer
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update customer details.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex h-full flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="John Doe"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="+211 9..."
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Street, area"
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="plot_number">
                                            Plot Number
                                        </Label>
                                        <Input
                                            id="plot_number"
                                            value={data.plot_number}
                                            onChange={(e) =>
                                                setData(
                                                    'plot_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. Plot 45B"
                                        />
                                        {errors.plot_number && (
                                            <p className="text-sm text-red-500">
                                                {errors.plot_number}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Connection / Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Zone</Label>
                                        <Select
                                            value={data.zone_id}
                                            onValueChange={(v) =>
                                                setData('zone_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((z) => (
                                                    <SelectItem
                                                        key={z.id}
                                                        value={z.id.toString()}
                                                    >
                                                        {z.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.zone_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.zone_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Area</Label>
                                        <Select
                                            value={data.area_id}
                                            onValueChange={(v) =>
                                                setData('area_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((a) => (
                                                    <SelectItem
                                                        key={a.id}
                                                        value={a.id.toString()}
                                                    >
                                                        {a.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.area_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.area_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Tariff</Label>
                                        <Select
                                            value={data.tariff_id}
                                            onValueChange={(v) =>
                                                setData('tariff_id', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tariff" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tariffs.map((t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id.toString()}
                                                    >
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tariff_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.tariff_id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={route('customers.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
