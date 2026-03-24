import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    CreditCard,
    Home,
    Mail,
    MapPin,
    Phone,
    Save,
    User,
} from 'lucide-react';

export default function CustomerCreate({ zones, tariffs, areas }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        plot_number: '',
        zone_id: '',
        area_id: '',
        tariff_id: '',
        installation_fee: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'));
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Customers', href: route('customers.index') },
        { title: 'New Customer', href: route('customers.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Customer" />

            <div className="mx-auto w-full p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link
                                href={route('customers.index')}
                                className="flex items-center gap-1 transition-colors hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Customers
                            </Link>
                        </div>
                        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">
                            New Customer
                        </h1>
                        <p className="mt-1 text-lg text-muted-foreground">
                            Onboard a new client and set up their connection.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Form Content */}
                        <div className="space-y-8 lg:col-span-2">
                            {/* Section: Basic Information */}
                            <Card className="border-none shadow-md ring-1 ring-border/50">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">
                                                Basic Information
                                            </CardTitle>
                                            <CardDescription>
                                                Primary contact details for the
                                                customer.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-sm font-semibold"
                                            >
                                                Full Name{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. John Doe"
                                                    className="pl-9"
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-xs font-medium text-red-500">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="phone"
                                                    className="text-sm font-semibold"
                                                >
                                                    Phone Number
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="phone"
                                                        value={data.phone}
                                                        onChange={(e) =>
                                                            setData(
                                                                'phone',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="+211 9..."
                                                        className="pl-9"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-semibold"
                                                >
                                                    Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="john@example.com"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section: Residence Details */}
                            <Card className="border-none shadow-md ring-1 ring-border/50">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Home className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">
                                                Residence Details
                                            </CardTitle>
                                            <CardDescription>
                                                Physical location and connection
                                                settings.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-6">
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="address"
                                                    className="text-sm font-semibold"
                                                >
                                                    Physical Address{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="address"
                                                        value={data.address}
                                                        onChange={(e) =>
                                                            setData(
                                                                'address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. Juba, Munuki"
                                                        className="pl-9"
                                                        required
                                                    />
                                                </div>
                                                {errors.address && (
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.address}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="plot_number"
                                                    className="text-sm font-semibold"
                                                >
                                                    Plot Number{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
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
                                                    placeholder="e.g. Plot 123"
                                                    required
                                                />
                                                {errors.plot_number && (
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.plot_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="zone"
                                                    className="text-sm font-semibold"
                                                >
                                                    Service Zone
                                                </Label>
                                                <Select
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'zone_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger id="zone">
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
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.zone_id}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="area"
                                                    className="text-sm font-semibold"
                                                >
                                                    Service Area
                                                </Label>
                                                <Select
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'area_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger id="area">
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
                                                    <p className="text-xs font-medium text-red-500">
                                                        {errors.area_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="tariff"
                                                className="text-sm font-semibold"
                                            >
                                                Pricing Tariff{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setData('tariff_id', value)
                                                }
                                                required
                                            >
                                                <SelectTrigger id="tariff">
                                                    <SelectValue placeholder="Select Tariff Plan" />
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
                                                <p className="text-xs font-medium text-red-500">
                                                    {errors.tariff_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar: Financials & Actions */}
                        <div className="space-y-8">
                            <Card className="overflow-hidden border-none shadow-md ring-1 ring-border/50">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-xl">
                                            Financials
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="installation_fee"
                                                className="text-sm font-semibold"
                                            >
                                                Installation Fee{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute top-2.5 left-3 text-sm font-medium text-muted-foreground">
                                                    SSP
                                                </span>
                                                <Input
                                                    id="installation_fee"
                                                    type="number"
                                                    value={
                                                        data.installation_fee
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'installation_fee',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="pl-12 font-mono text-lg"
                                                    required
                                                />
                                            </div>
                                            {errors.installation_fee && (
                                                <p className="text-xs font-medium text-red-500">
                                                    {errors.installation_fee}
                                                </p>
                                            )}
                                        </div>
                                        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-primary/80">
                                            This fee will be automatically added
                                            to the customer's initial invoice.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="h-12 w-full gap-2 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                    disabled={processing}
                                >
                                    <Save className="h-5 w-5" />
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Customer'}
                                </Button>
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-12 w-full text-base"
                                >
                                    <Link href={route('customers.index')}>
                                        Discard Changes
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
