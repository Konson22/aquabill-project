import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Eye, Gauge, MoreHorizontal, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

export default function MeterDepartmentCustomers({
    customers,
    filters,
    zones,
    areas = [],
    tariffs,
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const [zoneId, setZoneId] = useState(filters?.zone_id || 'all');
    const [areaId, setAreaId] = useState(filters?.area_id || 'all');
    const [tariffId, setTariffId] = useState(filters?.tariff_id || 'all');
    const [readingModalOpen, setReadingModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [sorting, setSorting] = useState([]);

    const readingForm = useForm({
        meter_id: '',
        reading_date: new Date().toISOString().split('T')[0],
        current_reading: '',
    });

    const openReadingModal = (customer) => {
        const meters = customer.meters || [];
        if (meters.length === 0) return;
        setSelectedCustomer(customer);
        readingForm.setData({
            meter_id: meters[0].id.toString(),
            reading_date: new Date().toISOString().split('T')[0],
            current_reading: '',
        });
        setReadingModalOpen(true);
    };

    const closeReadingModal = () => {
        setReadingModalOpen(false);
        setSelectedCustomer(null);
        readingForm.reset();
    };

    const handleReadingSubmit = (e) => {
        e.preventDefault();
        readingForm.post(route('meter-readings.store'), {
            onSuccess: () => closeReadingModal(),
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = {};
            if (search) query.search = search;
            if (zoneId && zoneId !== 'all') query.zone_id = zoneId;
            if (areaId && areaId !== 'all') query.area_id = areaId;
            if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;

            router.get(route('dashboard-meter-department.customers.index'), query, {
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

    const formatSupplyStatus = (status) => {
        if (!status) return '—';
        const s = String(status).toLowerCase();
        if (s === 'active') return 'Active';
        if (s === 'suspended') return 'Suspended';
        if (s === 'disconnect') return 'Disconnected';
        return status;
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Meter Department', href: route('dashboard') },
        { title: 'Customers', href: route('dashboard-meter-department.customers.index') },
    ];

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: () => <span className="font-bold text-foreground">Name</span>,
                cell: ({ row }) => (
                    <span className="font-medium text-foreground">
                        {row.original.name || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'phone',
                header: () => <span className="font-bold text-foreground">Phone</span>,
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.phone || '—'}
                    </span>
                ),
            },
            {
                id: 'meter_no',
                header: () => <span className="font-bold text-foreground">Meter No</span>,
                cell: ({ row }) => {
                    const meters = row.original.meters || [];
                    const numbers = meters.map((m) => m.meter_number).filter(Boolean);
                    return (
                        <span className="font-mono text-xs">
                            {numbers.length ? numbers.join(', ') : '—'}
                        </span>
                    );
                },
            },
            {
                id: 'zone',
                header: () => <span className="font-bold text-foreground">Zone</span>,
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.zone?.name || '—'}
                    </span>
                ),
            },
            {
                id: 'area',
                header: () => <span className="font-bold text-foreground">Area</span>,
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.area?.name || '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'supply_status',
                header: () => <span className="font-bold text-foreground">Supply Status</span>,
                cell: ({ row }) => {
                    const status = row.original.supply_status;
                    const label = formatSupplyStatus(status);
                    const statusClass =
                        status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : status === 'suspended'
                              ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                              : status === 'disconnect'
                                ? 'bg-red-50 text-red-700 ring-red-600/20'
                                : 'bg-muted/50 text-muted-foreground';
                    return (
                        <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusClass}`}
                        >
                            {label}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                header: () => (
                    <div className="text-right font-bold text-foreground">Actions</div>
                ),
                cell: ({ row }) => {
                    const customer = row.original;
                    const hasMeters = (customer.meters || []).length > 0;
                    return (
                        <div className="flex items-center justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    {hasMeters && (
                                        <DropdownMenuItem
                                            onClick={() => openReadingModal(customer)}
                                        >
                                            <Gauge className="mr-2 h-4 w-4" />
                                            Add Reading
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href={route('customers.show', customer.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data: customers?.data || [],
        columns,
        state: { sorting: sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers — Meter Department" />

            <div className="flex h-auto flex-col gap-6 pb-8">
                <div className="flex flex-wrap items-center justify-end gap-3 px-5 pb-4">
                    <Select value={tariffId} onValueChange={setTariffId}>
                        <SelectTrigger className="h-9 w-[160px] bg-background">
                            <SelectValue placeholder="Tariff" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tariffs</SelectItem>
                            {(tariffs || []).map((tariff) => (
                                <SelectItem key={tariff.id} value={tariff.id.toString()}>
                                    {tariff.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={zoneId} onValueChange={setZoneId}>
                        <SelectTrigger className="h-9 w-[160px] bg-background">
                            <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Zones</SelectItem>
                            {(zones || []).map((zone) => (
                                <SelectItem key={zone.id} value={zone.id.toString()}>
                                    {zone.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={areaId} onValueChange={setAreaId}>
                        <SelectTrigger className="h-9 w-[160px] bg-background">
                            <SelectValue placeholder="Area" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            {(areas || []).map((area) => (
                                <SelectItem key={area.id} value={area.id.toString()}>
                                    {area.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card className="overflow-hidden border shadow-sm">
                    <div className="flex flex-col gap-4 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                            Customers
                            <Badge variant="outline" className="font-mono">
                                {customers?.total ?? 0}
                            </Badge>
                        </h2>
                        <div className="relative w-full sm:w-1/2">
                            <Input
                                placeholder="Search by name, phone, address, or meter number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 rounded-lg border-border/60 bg-white shadow-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-4 py-2">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-[320px] text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="rounded-full bg-muted/50 p-8">
                                                    <Search className="h-10 w-10 text-muted-foreground/40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-muted-foreground">
                                                        No customers found
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Try adjusting search or filters.
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    onClick={clearFilters}
                                                    className="gap-2"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Clear filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {customers?.links?.length > 0 && (
                        <div className="border-t bg-muted/5 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs font-medium text-muted-foreground">
                                    Showing {customers.from ?? 0} — {customers.to ?? 0} of{' '}
                                    {customers.total}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {customers.links.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');
                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className="min-w-[36px] px-3"
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        dangerouslySetInnerHTML={{ __html: label }}
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
                    )}
                </Card>
            </div>

            <Dialog
                open={readingModalOpen}
                onOpenChange={(open) => {
                    setReadingModalOpen(open);
                    if (!open) {
                        setSelectedCustomer(null);
                        readingForm.reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Meter Reading</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                        <form
                            onSubmit={handleReadingSubmit}
                            className="grid gap-4 py-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                {selectedCustomer.name}
                                {(selectedCustomer.meters || []).length > 1 && (
                                    <span className="ml-1">— select meter below</span>
                                )}
                            </p>
                            {(selectedCustomer.meters || []).length > 1 && (
                                <div className="grid gap-2">
                                    <Label>Meter</Label>
                                    <Select
                                        value={readingForm.data.meter_id}
                                        onValueChange={(v) => readingForm.setData('meter_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select meter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(selectedCustomer.meters || []).map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.meter_number}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="reading_date">Reading Date</Label>
                                <Input
                                    id="reading_date"
                                    type="date"
                                    value={readingForm.data.reading_date}
                                    onChange={(e) =>
                                        readingForm.setData('reading_date', e.target.value)
                                    }
                                />
                                {readingForm.errors.reading_date && (
                                    <p className="text-xs text-red-500">
                                        {readingForm.errors.reading_date}
                                    </p>
                                )}
                            </div>
                            {(() => {
                                const meters = selectedCustomer?.meters || [];
                                const selectedMeterId = readingForm.data.meter_id;
                                const selectedMeter =
                                    meters.length === 1
                                        ? meters[0]
                                        : meters.find(
                                              (m) => String(m.id) === String(selectedMeterId),
                                          );
                                const lastReading =
                                    selectedMeter?.latest_reading?.current_reading ?? 0;
                                const currentVal = parseFloat(
                                    readingForm.data.current_reading || '0',
                                );
                                const isInvalid = currentVal <= lastReading;
                                return (
                                    <>
                                        <div className="grid gap-2">
                                            <Label>Last Reading</Label>
                                            <Input
                                                value={lastReading}
                                                disabled
                                                className="bg-muted font-mono"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Current reading must be greater than last reading.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_reading">Current Reading</Label>
                                            <Input
                                                id="current_reading"
                                                type="number"
                                                step="any"
                                                min={lastReading}
                                                value={readingForm.data.current_reading}
                                                onChange={(e) =>
                                                    readingForm.setData(
                                                        'current_reading',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={String(lastReading)}
                                            />
                                            {isInvalid &&
                                                readingForm.data.current_reading !== '' && (
                                                    <p className="text-xs text-red-500">
                                                        Must be greater than last reading (
                                                        {lastReading}).
                                                    </p>
                                                )}
                                            {readingForm.errors.current_reading && (
                                                <p className="text-xs text-red-500">
                                                    {readingForm.errors.current_reading}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeReadingModal}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        readingForm.processing ||
                                        (() => {
                                            const meters = selectedCustomer?.meters || [];
                                            const mid = readingForm.data.meter_id;
                                            const m =
                                                meters.length === 1
                                                    ? meters[0]
                                                    : meters.find(
                                                          (x) => String(x.id) === String(mid),
                                                      );
                                            const last = m?.latest_reading?.current_reading ?? 0;
                                            return (
                                                parseFloat(
                                                    readingForm.data.current_reading || '0',
                                                ) <= last
                                            );
                                        })()
                                    }
                                >
                                    {readingForm.processing ? 'Saving...' : 'Save Reading'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
