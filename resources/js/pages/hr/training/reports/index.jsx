import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function TrainingReportsIndex({ programs, filters = {}, totalCostYear }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('hr.training.reports.index'),
                {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                { preserveState: true, replace: true, only: ['programs', 'filters', 'totalCostYear'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, status, dateFrom, dateTo]);

    const year = new Date().getFullYear();

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Training reports', href: route('hr.training.reports.index') },
            ]}
        >
            <Head title="Training reports" />

            <div className="no-print flex flex-col gap-6 p-4 sm:p-6 print:hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <GraduationCap className="h-7 w-7 text-primary" />
                            Training programs report
                        </h1>
                        <p className="text-sm text-muted-foreground">Filter and review programs; print this page or export from backend when wired.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('hr.training.programs.index')}>All programs</Link>
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total cost ({year})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold tabular-nums">{formatCurrency(Number(totalCostYear ?? 0))}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative md:col-span-2">
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
                                            {row.location && <div className="text-xs text-muted-foreground">{row.location}</div>}
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
                                            No programs match your filters.
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

            <div className="hidden print:block print:p-8">
                <h1 className="text-xl font-bold">Training programs — {year}</h1>
                <p className="mt-2 text-sm">Total cost: {formatCurrency(Number(totalCostYear ?? 0))}</p>
                <table className="mt-6 w-full border-collapse border text-sm">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border px-2 py-1 text-left">Program</th>
                            <th className="border px-2 py-1 text-left">Provider</th>
                            <th className="border px-2 py-1 text-left">Dates</th>
                            <th className="border px-2 py-1 text-left">Cost</th>
                            <th className="border px-2 py-1 text-left">Status</th>
                            <th className="border px-2 py-1 text-left">Participants</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programs.data.map((row) => (
                            <tr key={row.id}>
                                <td className="border px-2 py-1">{row.title}</td>
                                <td className="border px-2 py-1">{row.provider ?? '—'}</td>
                                <td className="border px-2 py-1 text-xs">
                                    {(row.start_date?.slice(0, 10) ?? '—') + ' → ' + (row.end_date?.slice(0, 10) ?? '—')}
                                </td>
                                <td className="border px-2 py-1">{row.cost != null ? formatCurrency(Number(row.cost)) : '—'}</td>
                                <td className="border px-2 py-1">{row.status}</td>
                                <td className="border px-2 py-1">{row.participants_count ?? 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
