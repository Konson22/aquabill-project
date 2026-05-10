import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CircleDot, Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs = [
    { title: 'GIS', href: '/gis' },
    { title: 'Valves', href: '/gis/valves' },
];

export default function ValvesIndex({ valves, zones, pipes, filters = {} }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [zoneId, setZoneId] = useState(filters?.zone_id != null ? String(filters.zone_id) : 'all');
    const [pipeId, setPipeId] = useState(filters?.pipe_id != null ? String(filters.pipe_id) : 'all');
    const [valveType, setValveType] = useState(filters?.valve_type ?? 'all');
    const [status, setStatus] = useState(filters?.status ?? 'all');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('gis.valves.index'),
                {
                    search: search || undefined,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    pipe_id: pipeId === 'all' ? undefined : pipeId,
                    valve_type: valveType === 'all' ? undefined : valveType,
                    status: status === 'all' ? undefined : status,
                    sort: filters?.sort,
                    direction: filters?.direction,
                },
                { preserveScroll: true, preserveState: true, replace: true, only: ['valves', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, zoneId, pipeId, valveType, status, filters?.sort, filters?.direction]);

    const destroy = (id, code) => {
        if (!confirm(`Delete valve ${code}?`)) {
            return;
        }
        router.delete(route('gis.valves.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Valves" />
            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <CircleDot className="h-6 w-6 text-red-600" />
                            Valves
                        </h1>
                        <p className="text-sm text-muted-foreground">Isolation and control points on the network.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={route('gis.valves.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New valve
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:flex-wrap">
                    <div className="relative min-w-[180px] flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Valve code…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={valveType} onValueChange={setValveType}>
                        <SelectTrigger className="w-full md:w-44">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="main">Main</SelectItem>
                            <SelectItem value="control">Control</SelectItem>
                            <SelectItem value="isolation">Isolation</SelectItem>
                            <SelectItem value="washout">Washout</SelectItem>
                            <SelectItem value="air_release">Air release</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={zoneId} onValueChange={setZoneId}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All zones</SelectItem>
                            {zones.map((z) => (
                                <SelectItem key={z.id} value={String(z.id)}>
                                    {z.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={pipeId} onValueChange={setPipeId}>
                        <SelectTrigger className="w-full min-w-[140px] md:w-52">
                            <SelectValue placeholder="Pipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All pipes</SelectItem>
                            {pipes.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.pipe_code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Pipe</TableHead>
                                <TableHead>Zone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {valves.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                        No valves found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                valves.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-mono text-sm font-medium">{row.valve_code}</TableCell>
                                        <TableCell className="capitalize">{row.valve_type.replace(/_/g, ' ')}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.pipe?.pipe_code ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.zone?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.valves.show', row.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.valves.edit', row.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => destroy(row.id, row.valve_code)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {valves.links?.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                {valves.from}–{valves.to} of {valves.total}
                            </p>
                            <div className="flex gap-1">
                                {valves.links.map((link, i) => (
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
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : link.label}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> : link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> : link.label}
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
