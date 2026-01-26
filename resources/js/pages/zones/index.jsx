import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react'; // Added useForm
import { Eye, Map, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react'; // Added icons
import { useState } from 'react'; // Added useState

export default function Zones({
    zones,
    stats = { zones_count: 0, areas_count: 0, customers_count: 0 },
}) {
    const [deleteId, setDeleteId] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const { delete: destroy } = useForm();
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const handleDelete = () => {
        if (deleteId) {
            destroy(route('zones.destroy', deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
                onFinish: () => setDeleteId(null),
            });
        }
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setData({
            name: zone.name,
            description: zone.description || '',
        });
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        setEditingZone(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingZone) {
            put(route('zones.update', editingZone.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('zones.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Zones',
            href: route('zones.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zones" />

            {/* Summary Section */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Total Zones
                        </span>
                        <Map className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold">
                            {stats.zones_count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Operational regions
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Total Areas
                        </span>
                        <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.areas_count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Covered neighborhoods
                        </p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Total Customers
                        </span>
                        <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-green-600">
                            {stats.customers_count}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active connections
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">
                            Zones Overview
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage operational zones and view coverage details.
                        </p>
                    </div>
                    <Dialog
                        open={open}
                        onOpenChange={(val) => !val && closeModal()}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={() => setOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Zone
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingZone ? 'Edit Zone' : 'Add New Zone'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingZone
                                        ? `Edit details for ${editingZone.name}.`
                                        : 'Create a new operational zone.'}
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
                                        placeholder="e.g. North Zone"
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
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        {editingZone
                                            ? 'Update Zone'
                                            : 'Create Zone'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zone Name</TableHead>
                                <TableHead>Areas</TableHead>
                                <TableHead>Customers (Est.)</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.data.length > 0 ? (
                                zones.data.map((zone) => (
                                    <TableRow key={zone.id}>
                                        <TableCell className="font-medium">
                                            {zone.name}
                                        </TableCell>

                                        <TableCell>
                                            {zone.areas_count} Areas
                                        </TableCell>
                                        <TableCell>
                                            {zone.homes_count} Connections
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {zone.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'zones.show',
                                                            zone.id,
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEdit(zone)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        confirmDelete(zone.id)
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
                                        No zones found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <CardFooter className="flex items-center justify-between border-t p-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {zones.from || 0} to {zones.to || 0} of{' '}
                            {zones.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                            {zones.links &&
                                zones.links.map((link, index) => (
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
                </CardContent>
            </Card>

            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the zone and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
