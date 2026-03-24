import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    FileDown,
    Gauge,
    Pencil,
    Plus,
    Power,
    Search,
    ShieldAlert,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

export default function Meters({
    meters,
    homes,
    filters = {},
    stats = {
        total: 0,
        active: 0,
        inactive: 0,
        maintenance: 0,
        damage: 0,
    },
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        meter_number: '',
        meter_type: 'Analog',
        status: 'inactive',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('meters.update', editId), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setIsEditMode(false);
                    setEditId(null);
                },
            });
        } else {
            post(route('meters.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (meter) => {
        setEditId(meter.id);
        setIsEditMode(true);
        setData({
            meter_number: meter.meter_number,
            meter_type: meter.meter_type,
            status: meter.status,
        });
        setIsOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this meter?')) {
            router.delete(route('meters.destroy', id), {
                preserveScroll: true,
            });
        }
    };
    const handleSearch = (term) => {
        router.get(
            route('meters'),
            { search: term },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Meters',
            href: route('meters'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meters" />
            <div className="flex items-center justify-between pb-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Available Meters List
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Manage utility meters and installations.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={route('meters.export', filters)}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export CSV
                        </a>
                    </Button>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setIsEditMode(false);
                                    reset();
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Meter
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode
                                        ? 'Edit Meter'
                                        : 'Add New Meter'}
                                </DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? "Update the details of the meter. Click save when you're done."
                                        : "Enter the details of the new meter. Click save when you're done."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={submit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="meter_number"
                                        className="text-right"
                                    >
                                        Serial #
                                    </Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="meter_number"
                                            value={data.meter_number}
                                            onChange={(e) =>
                                                setData(
                                                    'meter_number',
                                                    e.target.value,
                                                )
                                            }
                                            className="col-span-3"
                                            disabled={isEditMode}
                                        />
                                        <InputError
                                            message={errors.meter_number}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="meter_type"
                                        className="text-right"
                                    >
                                        Type
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={data.meter_type}
                                            onValueChange={(value) =>
                                                setData('meter_type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Digital">
                                                    Digital
                                                </SelectItem>
                                                <SelectItem value="Analog">
                                                    Analog
                                                </SelectItem>
                                                <SelectItem value="Smart">
                                                    Smart
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.meter_type}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="status"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="inactive">
                                                    Inactive
                                                </SelectItem>
                                                <SelectItem value="maintenance">
                                                    Maintenance
                                                </SelectItem>
                                                <SelectItem value="damage">
                                                    Damaged
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.status}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Save changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Summary cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Total Meters
                        </span>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            All registered meters
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Active Meters
                        </span>
                        <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-emerald-600">
                            {stats.active}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Currently operational
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Inactive Meters
                        </span>
                        <Power className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-500">
                            {stats.inactive}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Disconnected or new
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Maintenance
                        </span>
                        <Wrench className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-orange-600">
                            {stats.maintenance}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Under repair/service
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Damaged
                        </span>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-red-600">
                            {stats.damage}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Broken or faulty
                        </p>
                    </div>
                </div>
            </div>
            {/* page content */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Available Meters List
                        </CardTitle>
                    </div>

                    <div className="relative flex w-1/2 items-center">
                        <div className="absolute top-0 bottom-0 left-0 flex items-center px-2 text-muted-foreground">
                            <Search className="" />
                        </div>
                        <Input
                            placeholder="Search meters..."
                            className="border-gray-300 bg-gray-50 pl-10"
                            defaultValue={filters.search || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Tariff</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Home Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {meters.data.length > 0 ? (
                                meters.data.map((meter) => (
                                    <TableRow key={meter.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <Gauge className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {meter.meter_number}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {meter.customer?.tariff?.name ??
                                                '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {meter.customer?.name ||
                                                    '---------'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {meter.customer?.address ||
                                                '----------'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    meter.status === 'active'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {meter.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'meters.show',
                                                            meter.id,
                                                        )}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
                                                    onClick={() =>
                                                        handleEdit(
                                                            meter,
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(
                                                            meter.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        No meters found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {meters.from || 0} to {meters.to || 0} of{' '}
                        {meters.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {meters.links &&
                            meters.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                    </div>
                </CardFooter>
            </Card>
        </AppLayout>
    );
}
