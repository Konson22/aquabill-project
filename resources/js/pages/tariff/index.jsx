import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { formatCurrency } from '@/lib/utils';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Tariffs({ tariffs }) {
    const [open, setOpen] = useState(false);
    const department = usePage().props.auth?.user?.department;

    const [editingTariff, setEditingTariff] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        price: '',
        fixed_charge: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTariff) {
            put(route('tariffs.update', editingTariff.id), {
                onSuccess: () => {
                    setOpen(false);
                    setEditingTariff(null);
                    reset();
                },
            });
        } else {
            post(route('tariffs.store'), {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (tariff) => {
        setEditingTariff(tariff);
        setData({
            name: tariff.name ?? '',
            price: tariff.price != null ? String(tariff.price) : '',
            fixed_charge:
                tariff.fixed_charge != null ? String(tariff.fixed_charge) : '',
            description: tariff.description ?? '',
        });
        setOpen(true);
    };

    const handleCreate = () => {
        setEditingTariff(null);
        reset();
        setOpen(true);
    };
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Tariffs',
            href: route('tariffs.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tariffs" />

            <div className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Tariffs
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Manage utility tariffs and pricing.
                    </p>
                </div>
                {department == 'admin' && (
                    <Dialog
                        open={open}
                        onOpenChange={(open) => {
                            setOpen(open);
                            if (!open) {
                                setEditingTariff(null);
                                reset();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Tariff
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingTariff
                                        ? 'Edit Tariff'
                                        : 'Add New Tariff'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingTariff
                                        ? 'Update tariff details.'
                                        : 'Create a new tariff plan for customers.'}
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                key={editingTariff?.id ?? 'new'}
                                onSubmit={handleSubmit}
                                className="grid gap-4 py-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. Residential"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-red-500">
                                            {errors.name}
                                        </span>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        Price per Unit (SSP)
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData('price', e.target.value)
                                        }
                                    />
                                    {errors.price && (
                                        <span className="text-xs text-red-500">
                                            {errors.price}
                                        </span>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fixed_charge">
                                        Fixed Charge (SSP)
                                    </Label>
                                    <Input
                                        id="fixed_charge"
                                        type="number"
                                        step="0.01"
                                        value={data.fixed_charge}
                                        onChange={(e) =>
                                            setData(
                                                'fixed_charge',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.fixed_charge && (
                                        <span className="text-xs text-red-500">
                                            {errors.fixed_charge}
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
                                        {editingTariff
                                            ? 'Update Tariff'
                                            : 'Save Tariff'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price / Unit</TableHead>
                                <TableHead>Fixed Charge</TableHead>
                                <TableHead>Customers</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tariffs.data.length > 0 ? (
                                tariffs.data.map((tariff) => (
                                    <TableRow key={tariff.id}>
                                        <TableCell className="font-medium">
                                            {tariff.name}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(tariff.price)}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                tariff.fixed_charge,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {tariff.homes_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'tariffs.show',
                                                            tariff.id,
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {department == 'admin' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    tariff,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
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
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center"
                                    >
                                        No tariffs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {tariffs.from || 0} to {tariffs.to || 0} of{' '}
                        {tariffs.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {tariffs.links &&
                            tariffs.links.map((link, index) => (
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
