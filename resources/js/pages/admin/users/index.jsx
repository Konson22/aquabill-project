import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, Shield, UserCog } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function UsersIndex({ users, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const isTypingSearch = useMemo(() => {
        return (filters?.search ?? '') !== search;
    }, [filters?.search, search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('users.index'),
                { search: search || undefined },
                { preserveScroll: true, preserveState: true, replace: true, only: ['users', 'filters'] },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <AppLayout breadcrumbs={[{ title: 'User Management', href: '/admin/users' }]}>
            <Head title="User Management" />
            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <UserCog className="h-6 w-6 text-primary" />
                            User Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage system users, departments, access, and activity.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Shield className="mr-2 h-4 w-4" />
                            Audit
                        </Button>
                        <Button size="sm" disabled>
                            Add User
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {isTypingSearch ? 'Searching…' : `${users.total} users`}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Roles</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Last Login</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                {user.department?.name ?? '—'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.roles ?? []).length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <Badge key={role.id} variant="secondary" className="text-[10px]">
                                                            {role.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge
                                                variant={(user.status ?? 'active') === 'active' ? 'success' : 'secondary'}
                                                className="capitalize text-[10px]"
                                            >
                                                {user.status ?? 'active'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {users.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-4 bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{users.from}</span> to{' '}
                                <span className="font-medium">{users.to}</span> of{' '}
                                <span className="font-medium">{users.total}</span> users
                            </div>
                            <div className="flex items-center gap-2">
                                {users.links.map((link, i) => (
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
