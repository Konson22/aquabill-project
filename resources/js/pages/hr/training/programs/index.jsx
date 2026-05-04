import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

function statusBadge(s) {
    const map = {
        planned: 'bg-slate-600',
        ongoing: 'bg-blue-600',
        completed: 'bg-emerald-600',
        cancelled: 'bg-rose-600',
    };
    return <Badge className={map[s] ?? ''}>{s}</Badge>;
}

export default function TrainingProgramsIndex({ programs, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [provider, setProvider] = useState(filters.provider ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('hr.training.programs.index'),
                {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    provider: provider || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                { preserveState: true, replace: true, only: ['programs', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, status, provider, dateFrom, dateTo]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Training programs', href: route('hr.training.programs.index') },
            ]}
        >
            <Head title="Training programs" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <GraduationCap className="h-7 w-7 text-primary" />
                            Training programs
                        </h1>
                        <p className="text-sm text-muted-foreground">Plan and track staff training, materials, and completion.</p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route('hr.training.programs.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New program
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3">
                    <div className="relative md:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search title, provider, location…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Filter by provider"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1" />
                        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1" />
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 font-semibold">Program</th>
                                    <th className="px-4 py-3 font-semibold">Provider</th>
                                    <th className="px-4 py-3 font-semibold">Dates</th>
                                    <th className="px-4 py-3 font-semibold">Cost</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Participants</th>
                                    <th className="px-4 py-3 font-semibold" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {programs.data.map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{row.title}</div>
                                            {row.location && (
                                                <div className="text-xs text-muted-foreground">{row.location}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{row.provider ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {row.start_date?.slice(0, 10) ?? '—'} → {row.end_date?.slice(0, 10) ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">
                                            {row.cost != null ? formatCurrency(Number(row.cost)) : '—'}
                                        </td>
                                        <td className="px-4 py-3">{statusBadge(row.status)}</td>
                                        <td className="px-4 py-3 tabular-nums">{row.participants_count ?? 0}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('hr.training.programs.show', row.id)}>Open</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {programs.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                            No programs yet. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {programs.links?.length > 3 && (
                        <div className="flex flex-wrap justify-end gap-2 border-t p-3">
                            {programs.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url}>
                                            {link.label === '&laquo; Previous' ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : link.label === 'Next &raquo;' ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                link.label
                                            )}
                                        </Link>
                                    ) : (
                                        <span>
                                            {link.label === '&laquo; Previous' ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : link.label === 'Next &raquo;' ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                link.label
                                            )}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
