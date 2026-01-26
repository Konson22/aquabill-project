import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function ZoneShow({ zone, all_zones = [] }) {
    const [open, setOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        zone_id: zone.id,
    });

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Zones',
            href: route('zones.index'),
        },
        {
            title: zone.name,
            href: route('zones.show', zone.id),
        },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingArea) {
            put(route('areas.update', editingArea.id), {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post(route('areas.store'), {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this area?')) {
            router.delete(route('areas.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const openEditModal = (area) => {
        setEditingArea(area);
        setData({
            name: area.name,
            description: area.description || '',
            zone_id: area.zone_id || zone.id,
        });
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditingArea(null);
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Zone - ${zone.name}`} />

            <div className="flex flex-col gap-6 py-4">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {zone.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage areas and locations within this zone.
                        </p>
                    </div>

                    <Dialog
                        open={open}
                        onOpenChange={(val) => !val && closeModal()}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={() => setOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Area
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingArea ? 'Edit Area' : 'Add New Area'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingArea
                                        ? `Edit details for ${editingArea.name}.`
                                        : `Create a new area within ${zone.name} zone.`}
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleSubmit}
                                className="grid gap-4 py-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Area A"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500">
                                            {errors.name}
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        className="resize-none"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.description && (
                                        <span className="text-xs text-red-500">
                                            {errors.description}
                                        </span>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="zone_id">Zone</Label>
                                    <Select
                                        value={data.zone_id?.toString()}
                                        onValueChange={(value) =>
                                            setData('zone_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {all_zones.map((z) => (
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
                                        <span className="text-xs text-red-500">
                                            {errors.zone_id}
                                        </span>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {editingArea
                                            ? 'Update Area'
                                            : 'Create Area'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Areas
                            </CardTitle>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {zone.areas_count || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Customers
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {zone.homes_count || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Areas Overview</CardTitle>
                        <CardDescription>
                            A list of all areas assigned to this zone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Customers</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {zone.areas && zone.areas.length > 0 ? (
                                    zone.areas.map((area) => (
                                        <TableRow key={area.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    {area.name}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {area.homes_count || 0}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                                                        onClick={() =>
                                                            openEditModal(area)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-900"
                                                        onClick={() =>
                                                            handleDelete(
                                                                area.id,
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
                                            colSpan={4}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <MapPin className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No areas found in this zone.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
