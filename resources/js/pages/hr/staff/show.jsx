import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Phone, Briefcase, CreditCard, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

function statusBadge(status) {
    if (status === 'active') {
        return <Badge className="bg-emerald-600">Active</Badge>;
    }
    if (status === 'on_leave') {
        return <Badge className="bg-amber-600">On leave</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
}

function formatDate(d) {
    if (!d) {
        return '—';
    }
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function participantStatusBadge(status) {
    const map = {
        enrolled: 'bg-slate-600',
        attended: 'bg-blue-600',
        completed: 'bg-emerald-600',
        absent: 'bg-rose-600',
    };
    return <Badge className={map[status] ?? 'bg-slate-600'}>{status?.replace('_', ' ')}</Badge>;
}

export default function HRStaffShow({ staffMember: s }) {
    const dept = s.hr_department;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Staff', href: route('hr.staff.index') },
                { title: s.name, href: route('hr.staff.show', s.id) },
            ]}
        >
            <Head title={`Staff — ${s.name}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={route('hr.staff.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{s.name}</h1>
                                {statusBadge(s.status)}
                            </div>
                            <p className="mt-1 font-mono text-sm text-muted-foreground">{s.employee_number ?? 'No employee #'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                Department
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{dept?.name ?? 'Unassigned'}</p>
                            {dept?.code && <p className="text-xs text-muted-foreground font-mono">{dept.code}</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{s.job_title ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">Hired {formatDate(s.hired_on)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            {s.email ? (
                                <p className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    {s.email}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">No email</p>
                            )}
                            {s.phone ? (
                                <p className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    {s.phone}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">No phone</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {(s.bank_name || s.bank_account_name || s.bank_account_number) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4" />
                                Bank details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm md:grid-cols-3">
                            <div>
                                <p className="text-muted-foreground">Bank</p>
                                <p className="font-medium">{s.bank_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Account name</p>
                                <p className="font-medium">{s.bank_account_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Account number</p>
                                <p className="font-mono font-medium">{s.bank_account_number ?? '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="attendance" className="w-full">
                    <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="leave">Leave</TabsTrigger>
                        <TabsTrigger value="salary">Salary</TabsTrigger>
                        <TabsTrigger value="payroll">Payroll</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="training">Training</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent attendance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Date</th>
                                                <th className="pb-2 pr-4">Status</th>
                                                <th className="pb-2 pr-4">In</th>
                                                <th className="pb-2">Out</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.attendances?.length ? (
                                                s.attendances.map((a) => (
                                                    <tr key={a.id}>
                                                        <td className="py-2 pr-4">{formatDate(a.attendance_date)}</td>
                                                        <td className="py-2 pr-4 capitalize">{a.status?.replace('_', ' ')}</td>
                                                        <td className="py-2 pr-4 font-mono text-xs">{a.clock_in ?? '—'}</td>
                                                        <td className="py-2 font-mono text-xs">{a.clock_out ?? '—'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        No attendance rows yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leave" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Leave balances ({new Date().getFullYear()})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Type</th>
                                                <th className="pb-2 pr-4">Entitled</th>
                                                <th className="pb-2 pr-4">Used</th>
                                                <th className="pb-2">Remaining</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.leave_balances?.length ? (
                                                s.leave_balances.map((b) => (
                                                    <tr key={b.id}>
                                                        <td className="py-2 pr-4">{b.leave_type?.name ?? '—'}</td>
                                                        <td className="py-2 pr-4 tabular-nums">{b.entitled_days}</td>
                                                        <td className="py-2 pr-4 tabular-nums">{b.used_days}</td>
                                                        <td className="py-2 tabular-nums font-medium">{b.remaining_days}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        No balances for this year.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent leave requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Type</th>
                                                <th className="pb-2 pr-4">Dates</th>
                                                <th className="pb-2 pr-4">Days</th>
                                                <th className="pb-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.leave_requests?.length ? (
                                                s.leave_requests.map((r) => (
                                                    <tr key={r.id}>
                                                        <td className="py-2 pr-4">{r.leave_type?.name ?? '—'}</td>
                                                        <td className="py-2 pr-4 text-xs">
                                                            {formatDate(r.start_date)} – {formatDate(r.end_date)}
                                                        </td>
                                                        <td className="py-2 pr-4 tabular-nums">{r.total_days}</td>
                                                        <td className="py-2 capitalize">{r.status}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        No requests yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="salary" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Salary structure history</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Effective</th>
                                                <th className="pb-2 pr-4">Base</th>
                                                <th className="pb-2 pr-4">Allowances</th>
                                                <th className="pb-2">Rates</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.salaries?.length ? (
                                                s.salaries.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="py-2 pr-4">{formatDate(row.effective_from)}</td>
                                                        <td className="py-2 pr-4 tabular-nums">{formatCurrency(Number(row.base_salary))}</td>
                                                        <td className="py-2 pr-4 text-xs text-muted-foreground">
                                                            H {formatCurrency(Number(row.housing_allowance))} · T{' '}
                                                            {formatCurrency(Number(row.transport_allowance))} · O{' '}
                                                            {formatCurrency(Number(row.other_allowances))}
                                                        </td>
                                                        <td className="py-2 text-xs">
                                                            Tax {(Number(row.tax_rate) * 100).toFixed(2)}% · Pension{' '}
                                                            {(Number(row.pension_rate) * 100).toFixed(2)}%
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        No salary rows yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payroll" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent payroll runs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Period</th>
                                                <th className="pb-2 pr-4">Net</th>
                                                <th className="pb-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.payrolls?.length ? (
                                                s.payrolls.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="py-2 pr-4">{p.payroll_period?.name ?? '—'}</td>
                                                        <td className="py-2 pr-4 tabular-nums font-medium">
                                                            {formatCurrency(Number(p.net_salary))}
                                                        </td>
                                                        <td className="py-2 capitalize">{p.status}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                                                        No payroll snapshots yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Documents on file</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Type</th>
                                                <th className="pb-2 pr-4">Number</th>
                                                <th className="pb-2 pr-4">Expires</th>
                                                <th className="pb-2">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.documents?.length ? (
                                                s.documents.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td className="py-2 pr-4">{doc.document_type?.name ?? '—'}</td>
                                                        <td className="py-2 pr-4 font-mono text-xs">{doc.document_number ?? '—'}</td>
                                                        <td className="py-2 pr-4">{formatDate(doc.expires_at)}</td>
                                                        <td className="py-2 max-w-xs truncate text-muted-foreground">{doc.notes ?? '—'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                        No documents uploaded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="training" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <GraduationCap className="h-4 w-4" />
                                    Training history
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="pb-2 pr-4">Program</th>
                                                <th className="pb-2 pr-4">Provider</th>
                                                <th className="pb-2 pr-4">Dates</th>
                                                <th className="pb-2 pr-4">Status</th>
                                                <th className="pb-2 pr-4">Score</th>
                                                <th className="pb-2 pr-4">Certificate</th>
                                                <th className="pb-2">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {s.training_participants?.length ? (
                                                s.training_participants.map((p) => {
                                                    const prog = p.training_program;
                                                    const cert = p.certificate_path;
                                                    return (
                                                        <tr key={p.id}>
                                                            <td className="py-2 pr-4">
                                                                {prog?.id ? (
                                                                    <Link
                                                                        href={route('hr.training.programs.show', prog.id)}
                                                                        className="font-medium text-primary hover:underline"
                                                                    >
                                                                        {prog?.title ?? '—'}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="font-medium">{prog?.title ?? '—'}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2 pr-4 text-muted-foreground">{prog?.provider ?? '—'}</td>
                                                            <td className="py-2 pr-4 text-xs">
                                                                {formatDate(prog?.start_date)} – {formatDate(prog?.end_date)}
                                                            </td>
                                                            <td className="py-2 pr-4">{participantStatusBadge(p.status)}</td>
                                                            <td className="py-2 pr-4 tabular-nums">{p.score != null ? p.score : '—'}</td>
                                                            <td className="py-2 pr-4">
                                                                {cert ? (
                                                                    <a
                                                                        href={`/storage/${cert.replace(/^\//, '')}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-primary underline-offset-4 hover:underline"
                                                                    >
                                                                        View
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-muted-foreground">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2 max-w-xs truncate text-muted-foreground">{p.remarks ?? '—'}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                                                        No training enrollments yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Internal notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.notes || 'No notes.'}</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
