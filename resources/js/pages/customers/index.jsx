import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ReadingModal from '@/components/reading-modal';
import ServiceChargeModal from '@/components/service-charge-modal';
import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Plus,
    MoreHorizontal,
    Filter,
    Download,
    Users,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Activity,
    CreditCard,
    X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

export default function Customers({ customers, serviceChargeTypes, zones = [], filters = {} }) {
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [isServiceChargeModalOpen, setIsServiceChargeModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [zoneId, setZoneId] = useState(filters?.zone_id ?? 'all');
    const isTypingSearch = useMemo(() => (filters?.search ?? '') !== search, [filters?.search, search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('customers.index'),
                { 
                    search: search || undefined,
                    zone_id: zoneId === 'all' ? undefined : zoneId
                },
                { preserveScroll: true, preserveState: true, replace: true, only: ['customers', 'filters'] },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, zoneId]);

    const handleRecordReading = (customer) => {
        setSelectedCustomer(customer);
        setIsReadingModalOpen(true);
    };

    const handleCreateServiceCharge = (customer) => {
        setSelectedCustomer(customer);
        setIsServiceChargeModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers Management" />

            <div className="flex h-full flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your customer database, billing zones, and service connections.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/customers/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, meter #, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                        {isTypingSearch && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Activity className="h-3 w-3 text-primary animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-48">
                            <Select value={zoneId} onValueChange={setZoneId}>
                                <SelectTrigger className="h-10">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                        <SelectValue placeholder="All Zones" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Zones</SelectItem>
                                    {zones.map((zone) => (
                                        <SelectItem key={zone.id} value={zone.id.toString()}>
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {zoneId !== 'all' && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setZoneId('all')}
                                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3">Customer Name</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Zone</th>
                                    <th className="px-4 py-3">Tariff</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-4 py-4">
                                            <Link
                                                href={route('customers.show', customer.id)}
                                                className="font-medium text-foreground hover:text-primary hover:underline"
                                            >
                                                {customer.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 capitalize">
                                            <span className="text-sm">{customer.phone}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-medium">{customer.zone?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-muted-foreground italic">
                                                {customer.tariff?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge 
                                                variant={customer.status === 'active' ? 'success' : 'secondary'}
                                                className="capitalize text-[10px]"
                                            >
                                                {customer.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 px-0 text-xs font-bold gap-1 text-indigo-600 hover:bg-transparent hover:text-indigo-700"
                                                    onClick={() => handleRecordReading(customer)}
                                                >
                                                    <Activity className="h-3 w-3" />
                                                    Record
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 px-0 text-xs font-bold gap-1 text-emerald-600 hover:bg-transparent hover:text-emerald-700"
                                                    onClick={() => handleCreateServiceCharge(customer)}
                                                >
                                                    <CreditCard className="h-3 w-3" />
                                                    Charge
                                                </Button>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 p-0 hover:bg-transparent"
                                                        asChild
                                                    >
                                                        <Link href={`/customers/${customer.id}`}>
                                                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-muted-foreground">
                                            No customers found. Click "New Customer" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {customers.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-4 bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{customers.from}</span> to <span className="font-medium">{customers.to}</span> of <span className="font-medium">{customers.total}</span> customers
                            </div>
                            <div className="flex items-center gap-2">
                                {customers.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                        className={!link.url ? 'opacity-50' : ''}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : 
                                                 link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : 
                                                 link.label}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reusable Reading Modal */}
            <ReadingModal 
                customer={selectedCustomer} 
                isOpen={isReadingModalOpen} 
                onClose={() => setIsReadingModalOpen(false)} 
            />

            {/* Service Charge Modal */}
            <ServiceChargeModal 
                customer={selectedCustomer}
                serviceChargeTypes={serviceChargeTypes}
                isOpen={isServiceChargeModalOpen} 
                onClose={() => setIsServiceChargeModalOpen(false)} 
            />
        </AppLayout>
    );
}