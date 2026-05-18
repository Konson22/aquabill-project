import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Eye, FilePlus2, Plus, Printer } from 'lucide-react';

function formatDate(value) {
    if (!value) {
        return '—';
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return String(value);
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(status) {
    const map = {
        pending: 'border-amber-300 bg-amber-50 text-amber-900',
        paid: 'border-blue-300 bg-blue-50 text-blue-900',
        completed: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        cancelled: 'border-slate-300 bg-slate-50 text-slate-700',
    };
    return (
        <Badge variant="outline" className={`capitalize ${map[status] ?? ''}`}>
            {status}
        </Badge>
    );
}

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function ConnectionRequestsIndex({ connectionRequests, filters = {} }) {
    const activeStatus = filters.status ?? 'all';
    const rows = connectionRequests?.data ?? [];

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Connection requests', href: route('connection-requests.index') },
    ];

    const setStatusFilter = (status) => {
        router.get(
            route('connection-requests.index'),
            status === 'all' ? {} : { status },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Connection requests" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <FilePlus2 className="h-6 w-6 text-primary" />
                            Connection requests
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Pre-customer applications with fee invoices for new water connections.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('connection-requests.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New request
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((f) => (
                        <Button
                            key={f.value}
                            type="button"
                            size="sm"
                            variant={activeStatus === f.value ? 'default' : 'outline'}
                            onClick={() => setStatusFilter(f.value)}
                        >
                            {f.label}
                        </Button>
                    ))}
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Request #</TableHead>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Zone</TableHead>
                                <TableHead>Issued</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                        No connection requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-mono text-sm font-medium">{req.request_number}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{req.name}</span>
                                                <span className="text-xs text-muted-foreground">{req.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{req.zone?.name ?? '—'}</TableCell>
                                        <TableCell>{formatDate(req.issued_date)}</TableCell>
                                        <TableCell className="text-right font-mono font-semibold">
                                            {formatCurrency(req.total_amount)}
                                        </TableCell>
                                        <TableCell>{statusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild title="View">
                                                    <Link href={route('connection-requests.show', req.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Print">
                                                    <Link
                                                        href={route('connection-requests.print', req.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {connectionRequests?.links?.length > 1 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                        {connectionRequests.links.map((link, i) =>
                            link.url ? (
                                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </Button>
                            ) : (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}