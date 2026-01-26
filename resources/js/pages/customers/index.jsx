import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    Download,
    Eye,
    Home,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Customers({ customers, filters, zones, tariffs }) {
    const [search, setSearch] = useState(filters.search || '');
    const [zoneId, setZoneId] = useState(filters.zone_id || 'all');
    const [tariffId, setTariffId] = useState(filters.tariff_id || 'all');
    const { auth } = usePage().props;
    const department = auth?.user?.department;

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = {};
            if (search) query.search = search;
            if (zoneId && zoneId !== 'all') query.zone_id = zoneId;
            if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;

            router.get(route('customers.index'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, zoneId, tariffId]);

    const clearFilters = () => {
        setSearch('');
        setZoneId('all');
        setTariffId('all');
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(route('customers.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const exportToExcel = () => {
        if (!customers?.data?.length) return;

        const data = customers.data.map((customer) => ({
            Name: customer.name,
            Email: customer.email || 'N/A',
            Phone: customer.phone || 'N/A',
            'Unit Connections': customer.homes_count || 0,
            Status: customer.homes_count > 0 ? 'Connected' : 'Pending',
        }));

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const cell = row[header] === null ? '' : row[header];
                        return `"${String(cell).replace(/"/g, '""')}"`;
                    })
                    .join(','),
            ),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `customers_export_${new Date().toISOString().split('T')[0]}.csv`,
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getInitials = (name) => {
        return name
            ? name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
            : '??';
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Customers', href: route('customers.index') },
    ];

    const [sorting, setSorting] = useState([]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                        className="p-0 font-bold text-foreground hover:bg-transparent"
                    >
                        Customer Identity
                        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const customer = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-[10px] font-bold">
                                    {getInitials(customer.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-medium text-foreground">
                                    {customer.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {customer.email || 'No email'}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'phone',
                header: () => (
                    <div className="text-center font-bold text-foreground">
                        Contact
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center text-xs font-medium text-muted-foreground">
                        {row.original.phone}
                    </div>
                ),
            },
            {
                accessorKey: 'homes_count',
                header: ({ column }) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() === 'asc',
                                )
                            }
                            className="p-0 font-bold text-foreground hover:bg-transparent"
                        >
                            Homes
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/30" />
                        </Button>
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <span className="font-mono text-sm font-bold">
                            {row.original.homes_count || 0}
                        </span>
                    </div>
                ),
            },
            {
                id: 'status',
                header: () => (
                    <div className="text-center font-bold text-foreground">
                        Status
                    </div>
                ),
                cell: ({ row }) => {
                    const hasHomes = row.original.homes_count > 0;
                    return (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`h-1.5 w-1.5 rounded-full ${hasHomes ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                                />
                                <span
                                    className={`text-[11px] font-medium ${hasHomes ? 'text-emerald-600' : 'text-muted-foreground'}`}
                                >
                                    {hasHomes ? 'Connected' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => (
                    <div className="text-right font-bold text-foreground">
                        Operations
                    </div>
                ),
                cell: ({ row }) => {
                    const customer = row.original;
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                            >
                                <Link
                                    href={route('customers.show', customer.id)}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Link>
                            </Button>

                            {department === 'admin' && (
                                <>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                    >
                                        <Link
                                            href={route(
                                                'customers.edit',
                                                customer.id,
                                            )}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleDelete(customer.id)
                                        }
                                        className="h-7 w-7 text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    );
                },
            },
        ],
        [department],
    );

    const table = useReactTable({
        data: customers?.data || [],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Directory" />

            <div className="flex flex-col gap-6 pb-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your customers and their service connections.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            className="h-11 gap-2 border-emerald-200 bg-emerald-50/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Data</span>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 gap-2 border-primary/20 bg-background/50 px-5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5"
                        >
                            <Link href={route('homes.index')}>
                                <Home className="h-4 w-4" />
                                <span>All Connections</span>
                            </Link>
                        </Button>
                        {department === 'admin' && (
                            <Button
                                asChild
                                className="h-11 gap-2 px-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                            >
                                <Link href={route('customers.create')}>
                                    <Plus className="h-4 w-4" />
                                    Add New Customer
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="overflow-hidden border shadow-sm">
                    <div className="flex flex-col gap-5 px-4 lg:flex-row lg:items-end">
                        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                    Search
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        placeholder="Name, email, or phone..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="h-9 pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                    Tariff
                                </Label>
                                <Select
                                    value={tariffId}
                                    onValueChange={setTariffId}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Tariffs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Tariffs
                                        </SelectItem>
                                        {tariffs?.map((tariff) => (
                                            <SelectItem
                                                key={tariff.id}
                                                value={tariff.id.toString()}
                                            >
                                                {tariff.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                    Zone
                                </Label>
                                <Select
                                    value={zoneId}
                                    onValueChange={setZoneId}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Zones" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Zones
                                        </SelectItem>
                                        {zones?.map((zone) => (
                                            <SelectItem
                                                key={zone.id}
                                                value={zone.id.toString()}
                                            >
                                                {zone.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(search || zoneId !== 'all' || tariffId !== 'all') && (
                            <Button
                                variant="ghost"
                                onClick={clearFilters}
                                className="h-9 gap-2 text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                        <h2 className="flex items-center gap-2 text-sm font-semibold">
                            Customer Records
                            <Badge variant="outline" className="font-mono">
                                {customers.total || 0}
                            </Badge>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b hover:bg-transparent"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
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
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className="px-4 py-2"
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
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
                                            className="h-[400px] text-center"
                                        >
                                            <div className="flex animate-in flex-col items-center justify-center gap-6 duration-500 fade-in zoom-in">
                                                <div className="relative">
                                                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                                                    <div className="relative rounded-full bg-muted/50 p-10 shadow-inner ring-1 ring-border/50">
                                                        <Search className="h-12 w-12 text-muted-foreground/30" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-black tracking-tight">
                                                        No matches discovered
                                                    </p>
                                                    <p className="mx-auto max-w-[280px] text-sm font-medium text-muted-foreground italic">
                                                        "We've searched the
                                                        entire grid, but
                                                        couldn't find those
                                                        records."
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    onClick={clearFilters}
                                                    className="mt-2 gap-2 font-bold shadow-lg shadow-muted/50 transition-all hover:bg-primary hover:text-white"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Reset Discovery Tool
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t bg-muted/5 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-xs font-semibold text-muted-foreground uppercase opacity-60">
                                    Showing {customers.from || 0} —{' '}
                                    {customers.to || 0} of {customers.total}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {customers.links &&
                                    customers.links.map((link, index) => {
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
                                                className={`h-9 min-w-[36px] px-3 font-semibold transition-all ${
                                                    link.active
                                                        ? 'shadow-md shadow-primary/20'
                                                        : 'border-border/50 bg-background/50 backdrop-blur-sm'
                                                } ${!link.url ? 'opacity-30' : 'hover:scale-105 active:scale-95'}`}
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
        </AppLayout>
    );
}
