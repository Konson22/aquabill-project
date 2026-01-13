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

export default function HomeEdit({ home, customers, zones, areas, tariffs }) {
    const { data, setData, put, processing, errors } = useForm({
        address: home.address || '',
        plot_number: home.plot_number || '',
        customer_id: home.customer_id?.toString() || '',
        zone_id: home.zone_id?.toString() || '',
        area_id: home.area_id?.toString() || '',
        tariff_id: home.tariff_id?.toString() || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('homes.update', home.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Homes', href: route('homes.index') },
                { title: 'Edit', href: route('homes.edit', home.id) },
            ]}
        >
            <Head title="Edit Home" />

            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Home
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update the details for this home.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex h-full flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Home Location</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        placeholder="Juba, Munuki Block C"
                                        required
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
                                        placeholder="Plot 123"
                                        required
                                    />
                                    {errors.plot_number && (
                                        <p className="text-sm text-red-500">
                                            {errors.plot_number}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment & Billing</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="customer">Customer</Label>
                                    <Select
                                        value={data.customer_id}
                                        onValueChange={(value) =>
                                            setData('customer_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem
                                                    key={customer.id}
                                                    value={customer.id.toString()}
                                                >
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.customer_id}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="zone">Zone</Label>
                                        <Select
                                            value={data.zone_id}
                                            onValueChange={(value) =>
                                                setData('zone_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone) => (
                                                    <SelectItem
                                                        key={zone.id}
                                                        value={zone.id.toString()}
                                                    >
                                                        {zone.name}
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
                                        <Label htmlFor="area">Area</Label>
                                        <Select
                                            value={data.area_id}
                                            onValueChange={(value) =>
                                                setData('area_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Area" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((area) => (
                                                    <SelectItem
                                                        key={area.id}
                                                        value={area.id.toString()}
                                                    >
                                                        {area.name}
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
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tariff">Tariff</Label>
                                    <Select
                                        value={data.tariff_id}
                                        onValueChange={(value) =>
                                            setData('tariff_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Tariff" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tariffs.map((tariff) => (
                                                <SelectItem
                                                    key={tariff.id}
                                                    value={tariff.id.toString()}
                                                >
                                                    {tariff.name}
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
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={route('homes.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Home
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
