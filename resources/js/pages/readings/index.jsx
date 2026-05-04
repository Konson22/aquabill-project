import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Activity,
    Search,
    Filter,
    Calendar,
    User,
    ArrowUpRight,
    Eye,
    FileSpreadsheet,
    Plus,
    History,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Camera,
    Pencil
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Meter Readings',
        href: '/readings',
    },
];

function formatReadingDate(value) {
    if (!value) return '';

    // Sometimes dates are serialized as objects (e.g. { date: "...", timezone: "..." })
    if (typeof value === 'object' && value !== null && typeof value.date === 'string') {
        value = value.date;
    }

    // Common Laravel formats: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
    if (typeof value === 'string' && value.includes(' ')) {
        value = value.split(' ')[0];
    }

    // If backend sends plain date (YYYY-MM-DD), treat it as a local calendar date
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-').map(Number);
        return new Intl.DateTimeFormat(undefined).format(new Date(y, m - 1, d));
    }

    try {
        const dt = new Date(value);
        if (Number.isNaN(dt.getTime())) return String(value);
        return new Intl.DateTimeFormat(undefined).format(dt);
    } catch {
        return String(value);
    }
}

export default function MeterReadings({ readings, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.from ?? '');
    const [dateTo, setDateTo] = useState(filters?.to ?? '');
    const [showFilters, setShowFilters] = useState(false);

    const debounceRef = useRef(null);

    useEffect(() => {
        // Debounce only search typing; date changes should feel instant
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                '/readings',
                {
                    search: search || undefined,
                    from: dateFrom || undefined,
                    to: dateTo || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search, dateFrom, dateTo]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Readings History" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <History className="h-6 w-6 text-indigo-500" />
                            Readings History
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage historical meter readings, consumption trends, and billing evidence.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/readings/export?${new URLSearchParams(
                                Object.entries({ search, from: dateFrom, to: dateTo }).filter(([_, v]) => v)
                            ).toString()}`}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Export CSV
                            </a>
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            New Reading
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by meter # or customer name..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Date Range
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters((v) => !v)}>
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>

                {(showFilters || dateFrom || dateTo) && (
                    <div className="bg-card rounded-xl border shadow-sm p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground">From</div>
                                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground">To</div>
                                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                >
                                    Clear
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                                    Hide
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Readings Table */}
                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs  border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50 uppercase tracking-wider text-muted-foreground">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Meter</th>
                                    <th className="px-6 py-4">Prev / Current</th>
                                    <th className="px-6 py-4">Consumption</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(readings?.data ?? []).map((reading) => (
                                    <tr key={reading.id} className="hover:bg-muted/30 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <span>{formatReadingDate(reading.reading_date)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium">{reading.meter?.customer?.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {reading.meter?.meter_number ?? 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">{reading.previous_reading}</span>
                                                <span className="text-muted-foreground/30">→</span>
                                                <span className="text-foreground">{reading.current_reading}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span>
                                                    {reading.consumption} m³
                                                </span>
                                                {reading.consumption > 50 && (
                                                    <span
                                                        className="text-red-500 inline-flex items-center"
                                                        title="High usage"
                                                        aria-label="High usage"
                                                    >
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" title="View Proof">
                                                    <ImageIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={route('readings.edit', reading.id)} title="Edit reading">
                                                        <Pencil className="h-4 w-4 text-amber-600" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={`/readings/${reading.id}`}>
                                                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(readings?.data ?? []).length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center text-sm text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Activity className="h-10 w-10 opacity-20" />
                                                <p>No meter readings match your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {readings.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Showing {readings.from} to {readings.to} of {readings.total} entries
                            </span>
                            <div className="flex items-center gap-1">
                                {readings.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        className="h-8 px-2 min-w-8"
                                        asChild={!!link.url}
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
        </AppLayout>
    );
}
