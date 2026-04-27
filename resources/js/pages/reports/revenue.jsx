import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    LineChart,
    Receipt,
    Search,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Revenue Reports',
        href: '/reports/revenue',
    },
];

function formatMoney(value) {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) {
        return 'SSP 0';
    }

    return `SSP ${number.toLocaleString()}`;
}

export default function RevenueReport({
    summary,
    rows,
    filters,
}) {
    const safeSummary = summary ?? {
        total_revenue: 0,
        total_paid: 0,
        total_outstanding: 0,
        payments_count: 0,
    };

    const safeRows = rows ?? [];
    const safeFilters = filters ?? { search: '', from: '', to: '' };

    const [search, setSearch] = useState(safeFilters.search ?? '');
    const [from, setFrom] = useState(safeFilters.from ?? '');
    const [to, setTo] = useState(safeFilters.to ?? '');

    const isDirty = useMemo(() => {
        return (
            (safeFilters.search ?? '') !== search ||
            (safeFilters.from ?? '') !== from ||
            (safeFilters.to ?? '') !== to
        );
    }, [from, safeFilters.from, safeFilters.search, safeFilters.to, search, to]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                breadcrumbs[0].href,
                {
                    search: search || undefined,
                    from: from || undefined,
                    to: to || undefined,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['summary', 'rows', 'filters'],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [from, search, to]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue Reports" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                            Revenue Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track collections, outstanding balances, and revenue performance across time.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={route('bills.index')}>
                                <Receipt className="mr-2 h-4 w-4" />
                                View Bills
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-700">{formatMoney(safeSummary.total_revenue)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Gross billed amount for selected period</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Collected</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                                    <Receipt className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{formatMoney(safeSummary.total_paid)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Total payments received</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Outstanding</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-800">
                                    <LineChart className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-amber-700">{formatMoney(safeSummary.total_outstanding)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Unpaid balances (arrears included)</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Payments</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
                                    <Receipt className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{Number(safeSummary.payments_count ?? 0).toLocaleString()}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Count of payments in period</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                                    <div className="text-xs text-muted-foreground">Chart placeholder (hook to backend series later)</div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                                    Coming soon
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <LineChart className="h-4 w-4" /> Revenue chart
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                    placeholder="Search customer / bill / receipt..."
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> From
                                    </div>
                                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> To
                                    </div>
                                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {isDirty ? 'Updating…' : 'Showing results for current filters'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <TableHead className="px-4 py-3">Date</TableHead>
                                <TableHead className="px-4 py-3">Reference</TableHead>
                                <TableHead className="px-4 py-3">Customer</TableHead>
                                <TableHead className="px-4 py-3 text-right">Paid</TableHead>
                                <TableHead className="px-4 py-3 text-right">Outstanding</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {safeRows.length > 0 ? (
                                safeRows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                                            {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 font-mono text-sm">
                                            {row.reference ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{row.customer_name ?? '—'}</span>
                                                <span className="text-xs text-muted-foreground">{row.account_number ?? ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right font-mono text-emerald-700">
                                            {formatMoney(row.paid)}
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right font-mono text-amber-700">
                                            {formatMoney(row.outstanding)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                        No revenue rows found for the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between border-t px-4 py-4 bg-muted/20">
                        <div className="text-xs text-muted-foreground">
                            Tip: once the backend is wired, we can add pagination and export.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
