import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { formatCurrency } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Settings', href: route('admin.settings') },
    { title: 'Service charge types', href: route('admin.service-charges.index') },
];

/**
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   editingType: object | null,
 *   data: object,
 *   setData: import('@inertiajs/react').InertiaFormProps['setData'],
 *   errors: Record<string, string>,
 *   processing: boolean,
 *   onSubmit: (e: React.FormEvent) => void,
 * }} props
 */
function ServiceChargeTypeDialog({
    open,
    onOpenChange,
    editingType,
    data,
    setData,
    errors,
    processing,
    onSubmit,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingType ? 'Edit fee type' : 'New fee type'}</DialogTitle>
                        <DialogDescription>
                            Name, unique code, and default amount used when issuing service charges to customers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sc-name">Name</Label>
                            <Input
                                id="sc-name"
                                placeholder="e.g. Reconnection fee"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sc-code">Code</Label>
                            <Input
                                id="sc-code"
                                placeholder="e.g. RECON_FEE"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="font-mono"
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sc-amount">Amount (SSP)</Label>
                            <Input
                                id="sc-amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="tabular-nums"
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sc-description">Description (optional)</Label>
                            <Textarea
                                id="sc-description"
                                placeholder="When this fee applies..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {editingType ? 'Save changes' : 'Create type'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/**
 * @param {{ types?: Array<Record<string, unknown>> }} props
 */
export default function ServiceCharges({ types = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        code: '',
        amount: '',
        description: '',
    });

    const filteredTypes = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        if (!needle) {
            return types;
        }

        return types.filter(
            (type) =>
                type.name?.toLowerCase().includes(needle) || type.code?.toLowerCase().includes(needle),
        );
    }, [types, searchTerm]);

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingType(null);
        reset();
    };

    const openCreate = () => {
        setEditingType(null);
        reset();
        setDialogOpen(true);
    };

    const openEdit = (type) => {
        setEditingType(type);
        setData({
            name: type.name,
            code: type.code,
            amount: String(type.amount ?? ''),
            description: type.description || '',
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: closeDialog };

        if (editingType) {
            put(route('admin.service-charges.update', editingType.id), options);
        } else {
            post(route('admin.service-charges.store'), options);
        }
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this service charge type? Existing issued charges keep their recorded amounts.')) {
            return;
        }

        destroy(route('admin.service-charges.destroy', id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service charge types" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                    <Link href={route('admin.settings')}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to settings
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Service charge types</h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Default fees for connection, reconnection, and other one-off services. The amount is
                            snapshotted when a charge is issued to a customer.
                        </p>
                    </div>
                    <Button className="h-9 gap-2 shrink-0" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        New fee type
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <RevenueStatCard title="Fee types" valueClassName="text-foreground">
                        {types.length.toLocaleString()}
                    </RevenueStatCard>
                    <RevenueStatCard title="Matching search" valueClassName="text-rose-600 dark:text-rose-400">
                        {filteredTypes.length.toLocaleString()}
                    </RevenueStatCard>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center border-b p-4">
                        <div className="relative flex-1 md:max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-9"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 text-[10px] font-bold tracking-wider text-muted-foreground uppercase hover:bg-muted/40">
                                    <TableHead className="px-6 py-3">Name</TableHead>
                                    <TableHead className="px-6 py-3">Code</TableHead>
                                    <TableHead className="px-6 py-3 text-right">Amount</TableHead>
                                    <TableHead className="px-6 py-3">Description</TableHead>
                                    <TableHead className="px-6 py-3 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-muted-foreground"
                                        >
                                            <CreditCard className="mx-auto mb-3 h-8 w-8 opacity-40" />
                                            <p className="font-medium text-foreground">
                                                {types.length === 0
                                                    ? 'No fee types yet'
                                                    : 'No types match your search'}
                                            </p>
                                            <p className="mt-1 text-sm">
                                                {types.length === 0
                                                    ? 'Create a type to use when issuing service charges.'
                                                    : 'Try a different name or code.'}
                                            </p>
                                            {types.length === 0 ? (
                                                <Button
                                                    size="sm"
                                                    className="mt-4 gap-2"
                                                    onClick={openCreate}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    New fee type
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTypes.map((type) => (
                                        <TableRow
                                            key={type.id}
                                            className="text-sm transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="px-6 py-4 font-medium">
                                                {type.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-[10px] tracking-wide uppercase"
                                                >
                                                    {type.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right font-semibold tabular-nums">
                                                {formatCurrency(type.amount)}
                                            </TableCell>
                                            <TableCell className="max-w-xs px-6 py-4 text-muted-foreground">
                                                <span className="line-clamp-2">
                                                    {type.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        title="Edit"
                                                        onClick={() => openEdit(type)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        title="Delete"
                                                        onClick={() => handleDelete(type.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <ServiceChargeTypeDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    } else {
                        setDialogOpen(true);
                    }
                }}
                editingType={editingType}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={handleSubmit}
            />
        </AppLayout>
    );
}
