import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function reqStatusBadge(status) {
    const variants = {
        pending: 'bg-amber-600',
        approved: 'bg-emerald-600',
        rejected: 'bg-rose-600',
        cancelled: 'bg-slate-600',
    };
    return <Badge className={variants[status] ?? ''}>{status}</Badge>;
}

function formatDate(d) {
    if (!d) {
        return '—';
    }
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function HRLeaveIndex({ leaveRequests, leaveTypes, filters = {} }) {
    const status = filters.status ?? 'all';

    const onFilter = (value) => {
        router.get(
            route('hr.leave.index'),
            { status: value === 'all' ? undefined : value },
            { preserveState: true, only: ['leaveRequests', 'filters'] },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Leave', href: route('hr.leave.index') },
            ]}
        >
            <Head title="Leave" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <ClipboardList className="h-7 w-7 text-primary" />
                            Leave
                        </h1>
                        <p className="text-sm text-muted-foreground">Leave types and recent requests (latest 50).</p>
                    </div>
                    <Select value={status === undefined || status === null ? 'all' : status} onValueChange={onFilter}>
                        <SelectTrigger className="w-full md:w-56">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Active leave types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {leaveTypes.map((t) => (
                                    <li key={t.id} className="flex items-start justify-between gap-4 rounded-lg border px-3 py-2 text-sm">
                                        <div>
                                            <p className="font-medium">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Default {t.default_days_per_year} d/yr · {t.is_paid ? 'Paid' : 'Unpaid'}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                                {leaveTypes.length === 0 && <p className="text-sm text-muted-foreground">No leave types seeded.</p>}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick facts</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Approvals and balance updates will be handled in the leave service layer. This page lists data for visibility.
                        </CardContent>
                    </Card>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="border-b bg-muted/40 px-4 py-3">
                        <h2 className="font-semibold">Leave requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/20">
                                    <th className="px-4 py-3 font-semibold">Staff</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Dates</th>
                                    <th className="px-4 py-3 font-semibold">Days</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Approver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leaveRequests.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{r.staff?.name}</div>
                                            <div className="text-xs text-muted-foreground">{r.staff?.hr_department?.name}</div>
                                        </td>
                                        <td className="px-4 py-3">{r.leave_type?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {formatDate(r.start_date)} – {formatDate(r.end_date)}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">{r.total_days}</td>
                                        <td className="px-4 py-3">{reqStatusBadge(r.status)}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {typeof r.approved_by === 'object' && r.approved_by?.name
                                                ? r.approved_by.name
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {leaveRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            No leave requests yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
