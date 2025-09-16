import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserCheck } from 'lucide-react';

const breadcrumbs = [
    { title: 'Staff', href: '/users' },
    { title: 'Create', href: '/users/create' },
];

export default function CreateStaff({ departments }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: '',
        department_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Staff Member" />

            <div className="max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center space-x-4">
                    <Link href="/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Staff Member</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Add a new staff member to the system</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <UserCheck className="mr-2 h-5 w-5" />
                            Staff Information
                        </CardTitle>
                        <CardDescription>Enter the details for the new staff member</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department</Label>
                                    <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                        <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((department) => (
                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                    {department.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.department_id}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href="/users">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Staff Member'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
