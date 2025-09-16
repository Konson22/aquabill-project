import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Building2, Edit, Eye, Plus, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Departments',
        href: '/departments',
    },
];

export default function DepartmentsIndex({ departments }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredDepartments, setFilteredDepartments] = useState(departments.data || departments);
    const [filteredStats, setFilteredStats] = useState({
        total_departments: (departments.data || departments).length,
        total_staff: (departments.data || departments).reduce((sum, dept) => sum + (dept.users_count || 0), 0),
    });

    // Filter departments based on search query
    useEffect(() => {
        const deptList = departments.data || departments;
        if (searchQuery.trim() === '') {
            setFilteredDepartments(deptList);
            setFilteredStats({
                total_departments: deptList.length,
                total_staff: deptList.reduce((sum, dept) => sum + (dept.users_count || 0), 0),
            });
        } else {
            const filtered = deptList.filter((department) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in department name
                const deptName = department.name?.toLowerCase() || '';
                if (deptName.includes(searchLower)) return true;

                return false;
            });

            setFilteredDepartments(filtered);
            setFilteredStats({
                total_departments: filtered.length,
                total_staff: filtered.reduce((sum, dept) => sum + (dept.users_count || 0), 0),
            });
        }
    }, [searchQuery, departments]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments Management" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Departments Management</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage organizational departments and staff assignments</p>
                </div>
                <Link href="/departments/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_departments}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_staff}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Across all departments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Staff</CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredStats.total_departments > 0 ? Math.round(filteredStats.total_staff / filteredStats.total_departments) : 0}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Per department</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Search Departments</CardTitle>
                    <CardDescription>Find departments by name</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Departments List */}
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
                                                    {department.users_count || 0} staff
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
        </AppLayout>
    );
}
