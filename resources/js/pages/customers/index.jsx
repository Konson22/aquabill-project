import DataGridTable from '@/components/data-grid-table';
import ReadingModal from '@/components/reading-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    BellRing,
    CircleCheck,
    CirclePower,
    CreditCard,
    Download,
    ExternalLink,
    Filter,
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
    { id: 'notified', label: 'Notified', icon: BellRing },
    { id: 'disconnected', label: 'Disconnected', icon: Unplug },
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

    const columns = useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Customer Name',
                flex: 1.4,
                minWidth: 180,
                sortable: true,
                renderCell: ({ row }) => (
                    <Link href={route('customers.show', row.id)} className="text-foreground hover:text-primary hover:underline">
                        {row.name}
                    </Link>
                ),
            },
            {
                field: 'phone',
                headerName: 'Phone',
                flex: 1,
                minWidth: 130,
                sortable: false,
            },
            {
                field: 'zone',
                headerName: 'Zone',
                flex: 1,
                minWidth: 140,
                sortable: false,
                renderCell: ({ row }) => <span className="text-sm font-medium">{row.zone?.name}</span>,
            },
            {
                field: 'tariff',
                headerName: 'Tariff',
                flex: 1,
                minWidth: 140,
                sortable: false,
                renderCell: ({ row }) => <span className="text-muted-foreground text-sm italic">{row.tariff?.name}</span>,
            },
            {
                field: 'status',
                headerName: 'Status',
                flex: 0.7,
                minWidth: 110,
                sortable: false,
                renderCell: ({ value }) => (
                    <Badge variant={value === 'active' ? 'success' : 'secondary'} className="text-[10px] capitalize">
                        {value}
                    </Badge>
                ),
            },
            {
                field: 'actions',
                headerName: 'Actions',
                flex: 1.2,
                minWidth: 240,
                sortable: false,
                filterable: false,
                align: 'right',
                headerAlign: 'right',
                renderCell: ({ row }) => (
                    <div className="flex h-full items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 px-0 text-xs text-indigo-600 hover:bg-transparent hover:text-indigo-700"
                            onClick={() => handleRecordReading(row)}
                        >
                            <Activity className="h-3 w-3" />
                            Record
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 px-0 text-xs text-emerald-600 hover:bg-transparent hover:text-emerald-700"
                            asChild
                        >
                            <Link href={route('customers.service-charges.create', row.id)}>
                                <CreditCard className="h-3 w-3" />
                                Charge
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 p-0 hover:bg-transparent" asChild>
                            <Link href={`/customers/${row.id}`}>
                                <ExternalLink className="text-muted-foreground h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                ),
            },
        ],
        [handleRecordReading],
    );

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

            <div className="flex max-h-screen flex-col gap-6 p-6">
               <div className="flex items-center justify-between">
                    {/* Tab Strip */}
                    <div className="flex flex-wrap items-center gap-1 border-b">
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const isActive = tab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setTab(id)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        'group inline-flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-all',
                                        isActive
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent',
                                    )}
                                >
                                    <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                                    <span>{label}</span>
                                    <span
                                        className={cn(
                                            'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md px-1.5 text-[10px] font-bold tabular-nums',
                                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {tabCounts[id] ?? 0}
                                    </span>
                                </button>
                            );
                        })}
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

                {/* DataGrid Section */}
                <div className="bg-card flex-1 overflow-hidden rounded-xl border shadow-sm">
                    <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by name, meter #, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                            {isTypingSearch && (
                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                    <Activity className="text-primary h-3 w-3 animate-pulse" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-48">
                                <Select value={zoneId} onValueChange={setZoneId}>
                                    <SelectTrigger className="h-10">
                                        <div className="flex items-center gap-2">
                                            <Filter className="text-muted-foreground h-3.5 w-3.5" />
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
                                    className="text-muted-foreground hover:text-destructive h-10 w-10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <DataGridTable
                        columns={columns}
                        paginator={customers}
                        routeName="customers.index"
                        queryParams={queryParams}
                        inertiaOptions={{ only: ['customers', 'tabCounts', 'filters'] }}
                        emptyLabel='No customers found. Click "New Customer" to get started.'
                    />
                </div>
            </div>

            {/* Reusable Reading Modal */}
            <ReadingModal customer={selectedCustomer} isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} />
        </AppLayout>
    );
}
