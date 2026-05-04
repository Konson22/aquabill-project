import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function statusBadge(status) {
    if (status === 'active') {
        return <Badge className="bg-emerald-600">Active</Badge>;
    }
    if (status === 'on_leave') {
        return <Badge className="bg-amber-600">On leave</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
}

export default function HRStaffIndex({ staffMembers, hrDepartments = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [hrDepartmentId, setHrDepartmentId] = useState(filters.hr_department_id ? String(filters.hr_department_id) : 'all');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('hr.staff.index'),
                {
                    search: search || undefined,
                    status: status === 'all' ? undefined : status,
                    hr_department_id: hrDepartmentId === 'all' ? undefined : hrDepartmentId,
                },
                { preserveState: true, replace: true, only: ['staffMembers', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, status, hrDepartmentId]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Staff', href: route('hr.staff.index') },
            ]}
        >
            <Head title="Staff" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Users className="h-7 w-7 text-primary" />
                            Staff
                        </h1>
                        <p className="text-sm text-muted-foreground">Non-login employee records and HR assignments.</p>
                    </div>
                    <Button asChild className="w-full md:w-auto">
                        <Link href={route('hr.staff.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New staff
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search name, employee #, email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full lg:w-44">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on_leave">On leave</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={hrDepartmentId} onValueChange={setHrDepartmentId}>
                        <SelectTrigger className="w-full lg:w-56">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            {hrDepartments.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name} ({d.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 font-semibold">Employee #</th>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Department</th>
                                    <th className="px-4 py-3 font-semibold">Job title</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {staffMembers.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs">{s.employee_number ?? '—'}</td>
                                        <td className="px-4 py-3 font-medium">{s.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.hr_department?.name ?? '—'}</td>
                                        <td className="px-4 py-3">{s.job_title ?? '—'}</td>
                                        <td className="px-4 py-3">{statusBadge(s.status)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('hr.staff.show', s.id)}>Profile</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {staffMembers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                            No staff found. Add a staff member or adjust filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {staffMembers.links?.length > 3 && (
                        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{staffMembers.from}</span> to{' '}
                                <span className="font-medium">{staffMembers.to}</span> of{' '}
                                <span className="font-medium">{staffMembers.total}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {staffMembers.links.map((link, i) => (
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
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
