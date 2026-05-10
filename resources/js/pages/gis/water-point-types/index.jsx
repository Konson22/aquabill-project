import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BookOpen, Plus, Search, Pencil, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs = [
    { title: 'GIS', href: '/gis' },
    { title: 'Water point types', href: '/gis/water-point-types' },
];

export default function WaterPointTypesIndex({ types, filters = {} }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const isTyping = useMemo(() => (filters?.search ?? '') !== search, [filters?.search, search]);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('gis.water-point-types.index'),
                { search: search || undefined, sort: filters?.sort, direction: filters?.direction },
                { preserveScroll: true, preserveState: true, replace: true, only: ['types', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, filters?.sort, filters?.direction]);

    const destroy = (id, name) => {
        if (!confirm(`Delete water point type "${name}"?`)) {
            return;
        }
        router.delete(route('gis.water-point-types.destroy', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water point types" />
            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-sky-600" />
                            Water point types
                        </h1>
                        <p className="text-sm text-muted-foreground">Categories used across the GIS registry.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={route('gis.water-point-types.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New type
                        </Link>
                    </Button>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search name or slug…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    {isTyping && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching…</span>}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {types.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                                        No types yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                types.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{row.slug}</TableCell>
                                        <TableCell className="text-right tabular-nums">{row.water_points_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.water-point-types.show', row.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('gis.water-point-types.edit', row.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => destroy(row.id, row.name)} disabled={row.water_points_count > 0}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {types.links?.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                                {types.from}–{types.to} of {types.total}
                            </p>
                            <div className="flex gap-1">
                                {types.links.map((link, i) => (
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
