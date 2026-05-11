import ReadingModal from '@/components/reading-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    BellRing,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    CirclePower,
    CreditCard,
    Download,
    ExternalLink,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Unplug,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

const TABS = [
    { id: 'all', label: 'All Customers', icon: Users },
    { id: 'active', label: 'Active', icon: CircleCheck },
    { id: 'inactive', label: 'Inactive', icon: CirclePower },
    { id: 'attention', label: 'Notified / Disconnected', icon: AlertCircle },
];

export default function Customers({ customers, zones = [], tabCounts = {}, filters = {} }) {
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [search, setSearch] = useState(filters?.search ?? '');
    const [zoneId, setZoneId] = useState(filters?.zone_id ?? 'all');
    const [tab, setTab] = useState(filters?.tab ?? 'all');
    const isTypingSearch = useMemo(() => (filters?.search ?? '') !== search, [filters?.search, search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('customers.index'),
                {
                    search: search || undefined,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    tab: tab === 'all' ? undefined : tab,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['customers', 'tabCounts', 'filters'],
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, zoneId, tab]);

    const handleRecordReading = useCallback((customer) => {
        setSelectedCustomer(customer);
        setIsReadingModalOpen(true);
    }, []);



    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            zone_id: zoneId === 'all' ? undefined : zoneId,
            tab: tab === 'all' ? undefined : tab,
        }),
        [search, zoneId, tab],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers Management" />


            <div className="flex flex-col flex-1 bg-card rounded-md m-3 border shadow-sm overflow-hidden">
                {/* Header with Tabs and Actions */}
                <div className="bg-sky-800 pt-4 px-4 sm:px-6 flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
                    <div className="flex w-full xl:w-auto bg-transparent p-0 h-auto gap-1 -mb-px overflow-x-auto hide-scrollbar">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const isActive = tab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setTab(id)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        'flex items-center justify-center gap-2 rounded-t-lg rounded-b-none border-0 px-4 sm:px-6 py-2.5 text-[13px] font-bold transition-colors',
                                        isActive
                                            ? 'bg-card text-sky-800 shadow-none'
                                            : 'text-white/70 hover:bg-white/20 hover:text-white bg-white/10'
                                    )}
                                >
                                    <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-sky-800' : 'text-white/70')} />
                                    <span>{label}</span>
                                    <span
                                        className={cn(
                                            'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm px-1 text-[9px] font-black tabular-nums',
                                            isActive ? 'bg-sky-800/10 text-sky-800' : 'bg-black/10 text-white'
                                        )}
                                    >
                                        {tabCounts[id] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 pb-3">
                        <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm rounded-lg bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button size="sm" className="h-9 gap-2 bg-white text-sky-800 hover:bg-white/90 shadow-sm rounded-lg font-semibold" asChild>
                            <Link href="/customers/create">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New Customer</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Toolbar: Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 border-b p-4  md:items-center md:justify-between">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, meter #, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background border-transparent focus-visible:bg-background focus-visible:border-primary/30 h-10 rounded-xl transition-all"
                        />
                        {isTypingSearch && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                <Activity className="h-3 w-3 text-primary animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-48">
                            <Select value={zoneId} onValueChange={setZoneId}>
                                <SelectTrigger className="h-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-primary/30 transition-all">
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
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Customers Table */}
                <div className="flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted border-y text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/30">
                                <TableHead className="px-6 py-4">Customer Name</TableHead>
                                <TableHead className="px-6 py-4 ">Phone</TableHead>
                                <TableHead className="px-6 py-4 ">Meter No</TableHead>
                                <TableHead className="px-6 py-4">Zone</TableHead>
                                <TableHead className="px-6 py-4 text-center ">Status</TableHead>
                                <TableHead className="px-6 py-4 text-right ">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No customers found. Click "New Customer" to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.data.map((customer) => (
                                    <TableRow key={customer.id} className="group hover:bg-sky-50/40 transition-colors duration-200 text-sm font-normal">
                                        <TableCell className="px-6 py-4 max-w-[180px] truncate">
                                            <Link href={route('customers.show', customer.id)} className="font-bold text-foreground hover:text-sky-700 leading-tight" title={customer.name}>
                                                {customer.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 ">{customer.phone}</TableCell>
                                        <TableCell className="px-6 py-4 ">
                                            <span className="text-muted-foreground font-mono">{customer.meters?.[0]?.meter_number ?? '—'}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 max-w-[120px] truncate" title={customer.zone?.name}>
                                            <span className="text-sm">{customer.zone?.name}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center ">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "uppercase text-[9px] font-black tracking-widest shadow-sm px-2 py-0.5",
                                                    customer.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted'
                                                )}
                                            >
                                                {customer.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right ">
                                            <div className="flex justify-end opacity-80 transition-opacity group-hover:opacity-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg shadow-sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
                                                        <DropdownMenuItem onSelect={() => handleRecordReading(customer)} className="cursor-pointer gap-2 py-2">
                                                            <Activity className="h-4 w-4 text-indigo-600" />
                                                            <span>Record Reading</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={route('customers.service-charges.create', customer.id)} className="gap-2 py-2 w-full flex">
                                                                <CreditCard className="h-4 w-4 text-emerald-600" />
                                                                <span>Add Charge</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={`/customers/${customer.id}`} className="gap-2 py-2 w-full flex">
                                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                                <span>View Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {customers.links && customers.links.length > 3 && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t px-6 py-4 bg-muted/10">
                        <span className="text-xs font-medium text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{customers.from}</span> to <span className="font-bold text-foreground">{customers.to}</span> of <span className="font-bold text-foreground">{customers.total}</span> customers
                        </span>
                        <div className="flex items-center gap-1">
                            {customers.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    className={cn(
                                        "h-8 min-w-8 px-2 rounded-lg",
                                        link.active ? "bg-sky-800 hover:bg-sky-900 shadow-sm" : "shadow-sm"
                                    )}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} preserveState preserveScroll>
                                            {link.label.includes('Previous') ? <ChevronLeft className="h-4 w-4" /> :
                                                link.label.includes('Next') ? <ChevronRight className="h-4 w-4" /> :
                                                    link.label}
                                        </Link>
                                    ) : (
                                        <span>
                                            {link.label.includes('Previous') ? <ChevronLeft className="h-4 w-4" /> :
                                                link.label.includes('Next') ? <ChevronRight className="h-4 w-4" /> :
                                                    link.label}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Reusable Reading Modal */}
            <ReadingModal customer={selectedCustomer} isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} />
        </AppLayout>
    );
}
