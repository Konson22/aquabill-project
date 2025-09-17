import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, Mail, Save, User, UserCheck, X } from 'lucide-react';

const breadcrumbs = [
    { title: 'User Management', href: '/users' },
    { title: 'Edit User', href: '#' },
];

const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusIcons = {
    active: UserCheck,
    inactive: X,
};

export default function EditUser({ user, departments }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        status: user.status || 'active',
        department_id: user.department_id ? user.department_id.toString() : 'null',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert "null" string back to null for department_id
        const submitData = {
            ...data,
            department_id: data.department_id === 'null' ? null : data.department_id,
        };

        patch(route('users.update', user.id), {
            data: submitData,
            onSuccess: () => {
                // Optionally redirect or show success message
            },
        });
    };

    const StatusIcon = statusIcons[data.status] || User;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User - ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/users">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit User</h1>
                            <p className="text-slate-600 dark:text-slate-400">Update user information and settings</p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            User Information
                        </CardTitle>
                        <CardDescription>Update the user's basic information and account settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                    Active
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                <div className="flex items-center gap-2">
                                                    <X className="h-4 w-4 text-red-600" />
                                                    Inactive
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department</Label>
                                    <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                                        <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-slate-400" />
                                                    No Department
                                                </div>
                                            </SelectItem>
                                            {departments.map((department) => (
                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-blue-600" />
                                                        {department.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department_id && <p className="text-sm text-red-600">{errors.department_id}</p>}
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-4">
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Change Password</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Leave password fields empty to keep current password</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter new password"
                                            className={errors.password ? 'border-red-500' : ''}
                                        />
                                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm new password"
                                            className={errors.password_confirmation ? 'border-red-500' : ''}
                                        />
                                        {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 border-t pt-6">
                                <Link href="/users">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
