import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Eye,
    FileSpreadsheet,
    Home as HomeIcon,
    MapPin,
    MoreHorizontal,
    Pencil,
    Receipt,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Homes({
    homes,
    filters,
    zones,
    areas,
    tariffs,
    summary,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [zoneId, setZoneId] = useState(filters.zone_id || 'all');
    const [areaId, setAreaId] = useState(filters.area_id || 'all');
    const [tariffId, setTariffId] = useState(filters.tariff_id || 'all');
    const { auth } = usePage().props;
    const department = auth?.user?.department;

    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [selectedHome, setSelectedHome] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        home_id: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        type: 'Service Fee',
        description: '',
    });

    const openInvoiceModal = (home) => {
        setSelectedHome(home);
        setData('home_id', home.id);
        setInvoiceModalOpen(true);
    };

    const handleInvoiceSubmit = (e) => {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                setInvoiceModalOpen(false);
                reset();
                setSelectedHome(null);
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this home?')) {
            router.delete(route('homes.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = {};
            if (search) query.search = search;
            if (zoneId && zoneId !== 'all') query.zone_id = zoneId;
            if (areaId && areaId !== 'all') query.area_id = areaId;
            if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;

            router.get(route('homes.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, zoneId, areaId, tariffId]);

    const clearFilters = () => {
        setSearch('');
        setZoneId('all');
        setAreaId('all');
        setTariffId('all');
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Homes',
            href: route('homes.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Homes" />

            <div className="flex flex-col gap-6 p-4 md:p-0">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Homes Management
                        </h1>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={tariffId}
                                onValueChange={setTariffId}
                            >
                                <SelectTrigger className="h-10 w-[140px] bg-white">
                                    <SelectValue placeholder="All Tariffs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Tariffs
                                    </SelectItem>
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

                            <Select value={zoneId} onValueChange={setZoneId}>
                                <SelectTrigger className="h-10 w-[140px] bg-white">
                                    <SelectValue placeholder="All Zones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Zones
                                    </SelectItem>
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

                            <Select value={areaId} onValueChange={setAreaId}>
                                <SelectTrigger className="h-10 w-[140px] bg-white">
                                    <SelectValue placeholder="All Areas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Areas
                                    </SelectItem>
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

                            {(search ||
                                zoneId !== 'all' ||
                                areaId !== 'all' ||
                                tariffId !== 'all') && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearFilters}
                                    title="Clear filters"
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="hidden h-4 w-px bg-border sm:block" />
                        <Button
                            variant="outline"
                            asChild
                            className="h-10 gap-2 bg-white"
                        >
                            <a
                                href={
                                    route('homes.export') +
                                    window.location.search
                                }
                            >
                                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                Export CSV
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Results Table */}
                <Card className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-5">
                        <h3 className="text-lg font-medium">
                            Filters & Search
                        </h3>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search by customer, plot, or address..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-[400px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto border-t-2 border-slate-200">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">
                                        Customer
                                    </TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Meter</TableHead>
                                    <TableHead>Zone</TableHead>
                                    <TableHead>Area</TableHead>
                                    <TableHead>Plot No</TableHead>
                                    <TableHead>Tariff</TableHead>
                                    <TableHead className="text-right print:hidden">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {homes.data.length > 0 ? (
                                    homes.data.map((home) => (
                                        <TableRow
                                            key={home.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell>
                                                {home.customer ? (
                                                    <span className="font-medium">
                                                        {home.customer.name}
                                                    </span>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="font-normal text-muted-foreground"
                                                    >
                                                        No Customer
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {home.customer ? (
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {home.customer.phone}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {home.meter ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="font-mono"
                                                        >
                                                            {
                                                                home.meter
                                                                    .meter_number
                                                            }
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">
                                                        Unmetered
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                                    {home.zone
                                                        ? home.zone.name
                                                        : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {home.area
                                                        ? home.area.name
                                                        : '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {home.plot_number || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {home.tariff
                                                        ? home.tariff.name
                                                        : '-'}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right print:hidden">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Open menu
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'homes.show',
                                                                    home.id,
                                                                )}
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {(department ===
                                                            'admin' ||
                                                            department ===
                                                                'finance') && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    openInvoiceModal(
                                                                        home,
                                                                    )
                                                                }
                                                            >
                                                                <Receipt className="mr-2 h-4 w-4" />
                                                                Create Invoice
                                                            </DropdownMenuItem>
                                                        )}
                                                        {department ===
                                                            'admin' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'homes.edit',
                                                                            home.id,
                                                                        )}
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                        Home
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            home.id,
                                                                        )
                                                                    }
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <HomeIcon className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No homes found matching your
                                                    criteria.
                                                </p>
                                                <Button
                                                    variant="link"
                                                    onClick={clearFilters}
                                                    className="px-0"
                                                >
                                                    Clear filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t p-4 print:hidden">
                        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {homes.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {homes.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {homes.total}
                                </span>{' '}
                                results
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {homes.links &&
                                    homes.links.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');
                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className={
                                                    !link.url
                                                        ? 'cursor-default opacity-50'
                                                        : ''
                                                }
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <style>{`
                @media print {
                    :global(body > *:not(#app)),
                    :global(#app > *:not(main)) {
                        display: none !important;
                    }
                    :global(main) {
                        padding: 0 !important;
                    }
                    :global(nav),
                    :global(header),
                    :global(aside),
                    :global(.print\\:hidden) {
                        display: none !important;
                    }
                    :global(.print\\:block) {
                        display: block !important;
                    }
                    :global(.print\\:mb-8) {
                        margin-bottom: 2rem !important;
                    }
                    :global(.print\\:grid-cols-3) {
                         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                     :global(.print\\:gap-4) {
                        gap: 1rem !important;
                     }
                }
            `}</style>

            {/* Invoice Modal */}
            <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Invoice</DialogTitle>
                        <DialogDescription>
                            Generate a manual invoice for{' '}
                            <span className="font-medium text-foreground">
                                {selectedHome?.customer?.name || 'this home'}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Invoice Type</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val) =>
                                        setData('type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Service Fee">
                                            Service Fee
                                        </SelectItem>
                                        <SelectItem value="Meter Replacement">
                                            Meter Replacement
                                        </SelectItem>
                                        <SelectItem value="Maintenance">
                                            Maintenance
                                        </SelectItem>
                                        <SelectItem value="Connection Fee">
                                            Connection Fee
                                        </SelectItem>
                                        <SelectItem value="Fine/Penalty">
                                            Fine/Penalty
                                        </SelectItem>
                                        <SelectItem value="Other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (SSP)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) =>
                                            setData('amount', e.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.amount && (
                                        <p className="text-xs text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) =>
                                            setData('due_date', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.due_date && (
                                        <p className="text-xs text-destructive">
                                            {errors.due_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter reason or additional details..."
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="resize-none"
                                />
                                {errors.description && (
                                    <p className="text-xs text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInvoiceModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Invoice'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
