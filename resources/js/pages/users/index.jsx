import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Edit, Eye, Plus, Search, UserCheck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'User Management',
        href: '/users',
    },
];

const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function UserManagement({ users, departments }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users.data || users);
    const [filteredDepartments, setFilteredDepartments] = useState(departments);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState('users');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: '',
        department_id: '',
    });

    const [filteredStats, setFilteredStats] = useState({
        total_staff: users.data?.length || users.length,
        active: (users.data || users).filter((u) => u.status === 'active').length,
        inactive: (users.data || users).filter((u) => u.status === 'inactive').length,
        total_departments: departments.length,
        total_department_staff: departments.reduce((sum, dept) => sum + (dept.users_count || 0), 0),
    });

    // Filter users based on search query
    useEffect(() => {
        const userList = users.data || users;
        if (searchQuery.trim() === '') {
            setFilteredUsers(userList);
            setFilteredStats((prev) => ({
                ...prev,
                total_staff: userList.length,
                active: userList.filter((u) => u.status === 'active').length,
                inactive: userList.filter((u) => u.status === 'inactive').length,
            }));
        } else {
            const filtered = userList.filter((user) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in user name
                const userName = user.name?.toLowerCase() || '';
                if (userName.includes(searchLower)) return true;

                // Search in email
                const email = user.email?.toLowerCase() || '';
                if (email.includes(searchLower)) return true;

                // Search in role
                const role = user.role?.toLowerCase() || '';
                if (role.includes(searchLower)) return true;

                // Search in department
                const department = user.department?.name?.toLowerCase() || '';
                if (department.includes(searchLower)) return true;

                return false;
            });

            setFilteredUsers(filtered);
            setFilteredStats((prev) => ({
                ...prev,
                total_staff: filtered.length,
                active: filtered.filter((u) => u.status === 'active').length,
                inactive: filtered.filter((u) => u.status === 'inactive').length,
            }));
        }
    }, [searchQuery, users]);

    // Filter departments based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDepartments(departments);
        } else {
            const filtered = departments.filter((department) => {
                const searchLower = searchQuery.toLowerCase();
                const deptName = department.name?.toLowerCase() || '';
                return deptName.includes(searchLower);
            });
            setFilteredDepartments(filtered);
        }
    }, [searchQuery, departments]);

    const handleCreateUser = (e) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">User Management</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage users, departments, and staff assignments</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showCreateForm ? 'Hide Form' : 'Add User'}
                    </Button>
                    <Link href="/departments/create">
                        <Button variant="outline">
                            <Building2 className="mr-2 h-4 w-4" />
                            Add Department
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_staff}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.active}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Active users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                        <X className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.inactive}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Inactive users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_departments}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Total departments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <UserCheck className="mr-2 h-5 w-5" />
                                    Create New User
                                </CardTitle>
                                <CardDescription>Add a new user to the system</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-6">
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
                                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search</CardTitle>
                    <CardDescription>Find users and departments by name, email, role, or department</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search users and departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
                    <TabsTrigger value="departments">Departments ({filteredDepartments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                            <CardDescription>
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredUsers.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Users className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No users found</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding a new user.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                    <UserCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <Badge className={statusColors[user.status] || 'bg-gray-100 text-gray-800'}>
                                                            {user.status}
                                                        </Badge>
                                                        {user.department && (
                                                            <span className="text-xs text-slate-500 dark:text-slate-400">{user.department.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link href={`/users/${user.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="departments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Departments</CardTitle>
                            <CardDescription>
                                {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredDepartments.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No departments found</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding a new department.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredDepartments.map((department) => (
                                        <div
                                            key={department.id}
                                            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{department.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Created {new Date(department.created_at).toLocaleDateString()}
                                                    </p>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <Badge variant="secondary">
                                                            <Users className="mr-1 h-3 w-3" />
                                                            {department.users_count || 0} users
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link href={`/departments/${department.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/departments/${department.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
