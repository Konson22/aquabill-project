import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2, UserPlus } from 'lucide-react';

export default function UserCreate({ departments, roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        department_id: '',
        roles: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const toggleRole = (roleId) => {
        const currentRoles = [...data.roles];
        if (currentRoles.includes(roleId)) {
            setData(
                'roles',
                currentRoles.filter((id) => id !== roleId),
            );
        } else {
            setData('roles', [...currentRoles, roleId]);
        }
    };

    const breadcrumbs = [
        { title: 'User Management', href: route('users.index') },
        { title: 'Create user', href: route('users.create') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create user" />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={route('users.index')}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                                <UserPlus className="h-4 w-4" />
                                Administration
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create user</h1>
                            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                                Add a staff account, assign a primary department, and attach roles. The user can sign in
                                with the email and password you set here.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2 sm:max-w-md">
                                <Label htmlFor="name">Full name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Jane Doe"
                                />
                                {errors.name ? <span className="text-sm text-destructive">{errors.name}</span> : null}
                            </div>
                            <div className="grid gap-2 sm:col-span-2 sm:max-w-md">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="jane@company.com"
                                />
                                {errors.email ? <span className="text-sm text-destructive">{errors.email}</span> : null}
                            </div>
                        </div>

                        <div className="grid gap-4 rounded-xl border border-dashed bg-muted/20 p-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                                {errors.password ? (
                                    <span className="text-sm text-destructive">{errors.password}</span>
                                ) : null}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Select
                                value={data.department_id}
                                onValueChange={(value) => setData('department_id', value)}
                            >
                                <SelectTrigger id="department" className="max-w-md">
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            <span className="capitalize">{dept.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id ? (
                                <span className="text-sm text-destructive">{errors.department_id}</span>
                            ) : null}
                        </div>

                        <div className="grid gap-2">
                            <Label>Roles</Label>
                            <div className="grid max-w-2xl grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.roles.includes(role.id.toString())}
                                                onCheckedChange={() => toggleRole(role.id.toString())}
                                            />
                                            <Label
                                                htmlFor={`role-${role.id}`}
                                                className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {role.name}
                                            </Label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground sm:col-span-2">
                                        No roles defined yet. You can still create the user and assign roles later.
                                    </p>
                                )}
                            </div>
                            {errors.roles ? <span className="text-sm text-destructive">{errors.roles}</span> : null}
                            {errors['roles.0'] ? (
                                <span className="text-sm text-destructive">{errors['roles.0']}</span>
                            ) : null}
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                            <Button variant="outline" type="button" asChild className="sm:min-w-[100px]">
                                <Link href={route('users.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="sm:min-w-[140px]">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create user
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
