import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Search, Shield, UserCog, Plus, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function UsersIndex({ users, departments, roles, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: '',
        roles: [],
    });

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

    const handleCreateUser = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleModalOpenChange = (open) => {
        setIsCreateModalOpen(open);
        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleDeleteUser = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const toggleRole = (roleId) => {
        const currentRoles = [...data.roles];
        if (currentRoles.includes(roleId)) {
            setData('roles', currentRoles.filter(id => id !== roleId));
        } else {
            setData('roles', [...currentRoles, roleId]);
        }
    };

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
                        <Dialog open={isCreateModalOpen} onOpenChange={handleModalOpenChange}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <form onSubmit={handleCreateUser}>
                                    <DialogHeader>
                                        <DialogTitle>Create New User</DialogTitle>
                                        <DialogDescription>
                                            Add a new user to the system. They will receive an email to verify their account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="John Doe"
                                                required
                                            />
                                            {errors.name && <span className="text-sm text-destructive">{errors.name}</span>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="john@example.com"
                                                required
                                            />
                                            {errors.email && <span className="text-sm text-destructive">{errors.email}</span>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                />
                                                {errors.password && <span className="text-sm text-destructive">{errors.password}</span>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                                            <span className="capitalize">{dept.name}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.department_id && <span className="text-sm text-destructive">{errors.department_id}</span>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Roles</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-1 p-3 border rounded-md bg-muted/20">
                                                {roles.map((role) => (
                                                    <div key={role.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`role-${role.id}`}
                                                            checked={data.roles.includes(role.id.toString())}
                                                            onCheckedChange={() => toggleRole(role.id.toString())}
                                                        />
                                                        <Label
                                                            htmlFor={`role-${role.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {role.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.roles && <span className="text-sm text-destructive">{errors.roles}</span>}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create User
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
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
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <Link href={route('users.show', user.id)} className="font-medium text-foreground hover:text-primary transition-colors">
                                                    {user.name}
                                                </Link>
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
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                                    <Link href={route('users.show', user.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                                                    <Link href={route('users.edit', user.id)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-12 text-center text-muted-foreground">
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
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
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
