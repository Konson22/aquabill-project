import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateDepartmentModal from './create-department-modal';

export default function HRDepartmentsIndex({ departments, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [active, setActive] = useState(filters.active ?? 'all');
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(
                route('hr.departments.index'),
                {
                    search: search || undefined,
                    active: active === 'all' ? undefined : active,
                },
                { preserveState: true, replace: true, only: ['departments', 'filters'] },
            );
        }, 300);
        return () => clearTimeout(t);
    }, [search, active]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Departments', href: route('hr.departments.index') },
            ]}
        >
            <Head title="HR Departments" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <Building2 className="h-7 w-7 text-primary" />
                            HR departments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Organizational units for staff (separate from system login departments).
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)} className="w-full shrink-0 sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        New department
                    </Button>
                </div>

                <CreateDepartmentModal open={createOpen} onOpenChange={setCreateOpen} />

                <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search name or code…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={active} onValueChange={setActive}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 font-semibold">Code</th>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Staff</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {departments.map((d) => (
                                    <tr key={d.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-sm">{d.code}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{d.name}</div>
                                            {d.description && <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums">{d.staff_count ?? 0}</td>
                                        <td className="px-4 py-3">
                                            {d.is_active ? (
                                                <Badge className="bg-emerald-600">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {departments.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                            No departments match your filters.
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
