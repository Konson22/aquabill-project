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
import { Droplets, Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs = [
    { title: 'GIS', href: '/gis' },
    { title: 'Water points', href: '/gis/water-points' },
];

export default function WaterPointsIndex({ waterPoints, zones, waterPointTypes, filters = {} }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [zoneId, setZoneId] = useState(filters?.zone_id != null ? String(filters.zone_id) : 'all');
    const [typeId, setTypeId] = useState(filters?.water_point_type_id != null ? String(filters.water_point_type_id) : 'all');
    const [status, setStatus] = useState(filters?.status ?? 'all');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('gis.water-points.index'),
                {
                    search: search || undefined,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    water_point_type_id: typeId === 'all' ? undefined : typeId,
                    status: status === 'all' ? undefined : status,
                    sort: filters?.sort,
                    direction: filters?.direction,
                },
                { preserveScroll: true, preserveState: true, replace: true, only: ['waterPoints', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, zoneId, typeId, status, filters?.sort, filters?.direction]);

    const destroy = (id, code) => {
        if (!confirm(`Delete water point ${code}?`)) {
            return;
        }
        router.delete(route('gis.water-points.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water points" />
            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Droplets className="h-6 w-6 text-sky-600" />
                            Water points
                        </h1>
                        <p className="text-sm text-muted-foreground">GIS registry of taps, kiosks, filling stations, and more.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={route('gis.water-points.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New water point
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:flex-wrap">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Code, name, manager phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={typeId} onValueChange={setTypeId}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {waterPointTypes.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={zoneId} onValueChange={setZoneId}>
                        <SelectTrigger className="w-full md:w-44">
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
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Zone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {waterPoints.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                        No water points match your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                waterPoints.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-mono text-sm font-medium">{row.code}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.water_point_type?.name ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.zone?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.water-points.show', row.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.water-points.edit', row.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => destroy(row.id, row.code)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {waterPoints.links?.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                {waterPoints.from}–{waterPoints.to} of {waterPoints.total}
                            </p>
                            <div className="flex gap-1">
                                {waterPoints.links.map((link, i) => (
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
