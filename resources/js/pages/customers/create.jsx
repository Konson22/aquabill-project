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

export default function CustomerCreate({ zones, tariffs, areas, meters }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        plot_number: '',
        zone_id: '',
        area_id: '',
        tariff_id: '',
        meter_id: '',
        initial_reading: '0',
        installation_fee: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Customers', href: route('customers.index') },
                { title: 'Create', href: route('customers.create') },
            ]}
        >
            <Head title="Create Customer" />

            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Create Customer
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new customer and optionally link a home.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="name"
                                            className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="John Doe"
                                            required
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
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Home Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="address"
                                        className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                    >
                                        Address
                                    </Label>
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
                                    <Label
                                        htmlFor="plot_number"
                                        className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                    >
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="zone">Zone</Label>
                                        <Select
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
                                    <Label
                                        htmlFor="tariff"
                                        className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                    >
                                        Tariff
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setData('tariff_id', value)
                                        }
                                        required
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Meter Details (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="meter">Select Meter</Label>
                                    <Select
                                        value={data.meter_id}
                                        onValueChange={(value) =>
                                            setData('meter_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a meter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {meters.length > 0 ? (
                                                meters.map((meter) => (
                                                    <SelectItem
                                                        key={meter.id}
                                                        value={meter.id.toString()}
                                                    >
                                                        {meter.meter_number} -{' '}
                                                        {meter.meter_type}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem
                                                    value="none"
                                                    disabled
                                                >
                                                    No available meters
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.meter_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.meter_id}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="initial_reading">
                                        Initial Reading
                                    </Label>
                                    <Input
                                        id="initial_reading"
                                        type="number"
                                        value={data.initial_reading}
                                        onChange={(e) =>
                                            setData(
                                                'initial_reading',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    {errors.initial_reading && (
                                        <p className="text-sm text-red-500">
                                            {errors.initial_reading}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="installation_fee"
                                        className="after:ml-0.5 after:text-red-500 after:content-['*']"
                                    >
                                        Installation Fee
                                    </Label>
                                    <Input
                                        id="installation_fee"
                                        type="number"
                                        value={data.installation_fee}
                                        onChange={(e) =>
                                            setData(
                                                'installation_fee',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.installation_fee && (
                                        <p className="text-sm text-red-500">
                                            {errors.installation_fee}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={route('customers.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
