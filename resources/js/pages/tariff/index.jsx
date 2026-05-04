import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

const breadcrumbs = [
    {
        title: 'Tariffs',
        href: '/tariffs',
    },
];

export default function Tariffs({ tariffs }) {
    const { auth } = usePage().props;
    /** Align with sidebar: admin department (and legacy users with no department) may manage tariffs. */
    const canManageTariffs = (auth.user?.department?.name || 'admin') === 'admin';

    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [activeTariff, setActiveTariff] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        price_per_unit: '',
        fixed_charge: '',
    });

    const editForm = useForm({
        name: '',
        price_per_unit: '',
        fixed_charge: '',
    });

    const deleteForm = useForm({});

    const submit = (event) => {
        event.preventDefault();

        post(route('tariffs.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
            },
        });
    };

    const openEdit = (tariff) => {
        setActiveTariff(tariff);
        editForm.setData({
            name: tariff.name ?? '',
            price_per_unit: tariff.price_per_unit ?? '',
            fixed_charge: tariff.fixed_charge ?? '',
        });
        editForm.clearErrors();
        setEditOpen(true);
    };

    const submitEdit = (event) => {
        event.preventDefault();

        if (!activeTariff) return;

        editForm.put(route('tariffs.update', activeTariff.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                setActiveTariff(null);
            },
        });
    };

    const openDelete = (tariff) => {
        setActiveTariff(tariff);
        setDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!activeTariff) return;

        deleteForm.delete(route('tariffs.destroy', activeTariff.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setActiveTariff(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Tariffs" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Zap className="h-6 w-6 text-amber-500" />
                            Billing Tariffs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure billing rates, unit prices, and fixed charges for different customer categories.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        {canManageTariffs && (
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Tariff
                                </Button>
                            </DialogTrigger>
                        )}
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Tariff</DialogTitle>
                                <DialogDescription>
                                    Add a new billing tariff with unit and fixed rates.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tariff Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        placeholder="e.g. DOMESTIC"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price_per_unit">Price Per Unit (SSP)</Label>
                                    <Input
                                        id="price_per_unit"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price_per_unit}
                                        onChange={(event) => setData('price_per_unit', event.target.value)}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.price_per_unit} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fixed_charge">Fixed Charge (SSP)</Label>
                                    <Input
                                        id="fixed_charge"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.fixed_charge}
                                        onChange={(event) => setData('fixed_charge', event.target.value)}
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.fixed_charge} />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Tariff'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <TableHead className="px-4 py-3">Tariff</TableHead>
                                <TableHead className="px-4 py-3 text-right">Price Per Unit</TableHead>
                                <TableHead className="px-4 py-3 text-right">Fixed Charge</TableHead>
                                <TableHead className="px-4 py-3 text-right">Created</TableHead>
                                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tariffs.length > 0 ? (
                                tariffs.map((tariff) => (
                                    <TableRow key={tariff.id}>
                                        <TableCell className="px-4 py-4 font-semibold">
                                            <Link
                                                href={route('tariffs.show', tariff.id)}
                                                className="text-primary hover:underline"
                                            >
                                                {tariff.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right font-mono">
                                            {formatCurrency(tariff.price_per_unit)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right font-mono">
                                            {formatCurrency(tariff.fixed_charge)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right text-sm text-muted-foreground">
                                            {new Date(tariff.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild className="h-8 px-2">
                                                    <Link href={route('tariffs.show', tariff.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {canManageTariffs && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 px-2"
                                                            onClick={() => openEdit(tariff)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-8 px-2"
                                                            onClick={() => openDelete(tariff)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                        No tariffs found. Use "Create Tariff" to add one.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Edit modal */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Tariff</DialogTitle>
                            <DialogDescription>
                                Update tariff name and rates.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submitEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_name">Tariff Name</Label>
                                <Input
                                    id="edit_name"
                                    value={editForm.data.name}
                                    onChange={(event) => editForm.setData('name', event.target.value)}
                                />
                                <InputError message={editForm.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_price_per_unit">Price Per Unit (SSP)</Label>
                                <Input
                                    id="edit_price_per_unit"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.price_per_unit}
                                    onChange={(event) => editForm.setData('price_per_unit', event.target.value)}
                                />
                                <InputError message={editForm.errors.price_per_unit} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_fixed_charge">Fixed Charge (SSP)</Label>
                                <Input
                                    id="edit_fixed_charge"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editForm.data.fixed_charge}
                                    onChange={(event) => editForm.setData('fixed_charge', event.target.value)}
                                />
                                <InputError message={editForm.errors.fixed_charge} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete confirm */}
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Tariff</DialogTitle>
                            <DialogDescription>
                                This will permanently delete the tariff.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                            <span className="font-medium">Tariff:</span> {activeTariff?.name ?? '—'}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}