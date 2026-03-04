import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, Pencil, Plus, Shield, ShieldAlert, ShieldCheck, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { DepartmentSelect } from './components/department-select';
import { EditUserDialog } from './components/edit-user-dialog';

export default function Users({ users, departments = [], zones = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('users.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
        department: 'admin',
    });

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Users',
            href: route('users.index'),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getDepartmentIcon = (dept) => {
        switch (dept) {
            case 'admin':
                return (
                    <ShieldAlert className="mr-2 h-4 w-4 text-destructive" />
                );
            case 'finance':
                return (
                    <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                );
            case 'meters':
                return <Shield className="mr-2 h-4 w-4 text-blue-500" />;
            default:
                return <User className="mr-2 h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage system users, access roles, and permissions.
                        </p>
                    </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new user account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submit} className="grid gap-4 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. John Doe"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <DepartmentSelect
                                    id="department"
                                    value={data.department}
                                    onValueChange={(value) =>
                                        setData('department', value)
                                    }
                                    error={errors.department}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                        />
                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    Create User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <EditUserDialog
                    open={editOpen}
                    onOpenChange={(open) => {
                        setEditOpen(open);
                        if (!open) setEditingUser(null);
                    }}
                    user={editingUser}
                    zones={zones}
                    onSuccess={() => setEditingUser(null)}
                />
                </div>

                {departments.length > 0 && (
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                            Departments
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {departments.map((dept) => (
                                <Badge
                                    key={dept.id}
                                    variant="secondary"
                                    className="flex w-fit items-center capitalize"
                                >
                                    {getDepartmentIcon(dept.name)}
                                    <span>{dept.name}</span>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{user.name}</span>
                                                    <span className="text-xs text-muted-foreground capitalize">
                                                        {user.department}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {getDepartmentIcon(
                                                    user.department,
                                                )}
                                                <span className="capitalize">
                                                    {user.department}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-normal"
                                            >
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.created_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'users.show',
                                                            user.id,
                                                        )}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Are you sure?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action
                                                                cannot be
                                                                undone. This
                                                                will permanently
                                                                delete the user.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        user.id,
                                                                    )
                                                                }
                                                                className="bg-red-600 text-white hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {users.from || 0} to {users.to || 0} of{' '}
                        {users.total} results
                    </div>
                    <div className="flex items-center space-x-2">
                        {users.links &&
                            users.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    asChild={!!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                    </div>
                </CardFooter>
            </Card>
        </AppLayout>
    );
}
