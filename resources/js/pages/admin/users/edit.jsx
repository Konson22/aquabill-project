import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function UserEdit({ user, departments, roles }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        department_id: user.department_id?.toString() ?? '',
        roles: user.roles ?? [],
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('users.update', user.id));
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
        <AppLayout>
            <Head title={`Edit User - ${user.name}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('users.index')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-sm text-muted-foreground">Update account details and permissions for {user.name}</p>
                    </div>
                </div>

                <div className="max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="John Doe"
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
                                    required
                                    placeholder="john@example.com"
                                />
                                {errors.email && <span className="text-sm text-destructive">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-lg bg-muted/20 border border-dashed">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password (optional)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
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
                                    placeholder="••••••••"
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
                            <Label>Roles & Permissions</Label>
                            <div className="grid grid-cols-2 gap-3 mt-1 p-4 border rounded-lg bg-muted/30">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.id.toString())}
                                            onCheckedChange={() => toggleRole(role.id.toString())}
                                        />
                                        <Label
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.roles && <span className="text-sm text-destructive">{errors.roles}</span>}
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Button variant="outline" type="button" asChild>
                                <Link href={route('users.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update User
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
