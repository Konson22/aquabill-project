import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    Eye,
    Home,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Customers',
            href: route('customers.index'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Customers
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your customer base, verify details, and track
                            connections.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href={route('homes.index')}>
                                <Home className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    All Connections
                                </span>
                                <span className="sm:hidden">Homes</span>
                            </Link>
                        </Button>
                        {department === 'admin' && (
                            <Button asChild className="gap-2 shadow-sm">
                                <Link href={route('customers.create')}>
                                    <Plus className="h-4 w-4" />
                                    Add Customer
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">
                            Filters & Search
                        </CardTitle>
                        <CardDescription>
                            Find customers by name, phone, zone, or tariff plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                                <Select
                                    value={tariffId}
                                    onValueChange={setTariffId}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Tariff" />
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

                                <Select
                                    value={zoneId}
                                    onValueChange={setZoneId}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Zone" />
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

                                {(search ||
                                    zoneId !== 'all' ||
                                    tariffId !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearFilters}
                                        title="Clear filters"
                                        className="shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card className="overflow-hidden">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">
                                Total Customers{' '}
                                <Badge variant="secondary" className="ml-2">
                                    {customers.total}
                                </Badge>
                            </h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[300px]">
                                        Customer
                                    </TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-center">
                                        Homes
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.data.length > 0 ? (
                                    customers.data.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {getInitials(
                                                                customer.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {customer.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {customer.email ||
                                                                'No email'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium">
                                                        {customer.phone}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {customer.homes_count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        title="View Profile"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'customers.show',
                                                                customer.id,
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                View Profile
                                                            </span>
                                                        </Link>
                                                    </Button>

                                                    {department === 'admin' && (
                                                        <>
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Edit Details"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'customers.edit',
                                                                        customer.id,
                                                                    )}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">
                                                                        Edit
                                                                        Details
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        customer.id,
                                                                    )
                                                                }
                                                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Delete
                                                                </span>
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
                                            colSpan={4}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No customers found matching
                                                    your criteria.
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
                    <div className="border-t p-4">
                        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {customers.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {customers.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {customers.total}
                                </span>{' '}
                                results
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {customers.links &&
                                    customers.links.map((link, index) => {
                                        // Clean up HTML entities in labels like &laquo;
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
        </AppLayout>
    );
}
