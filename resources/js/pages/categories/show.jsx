import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Calendar, DollarSign, Edit, Eye, Mail, MapPin, Phone, Settings, Tag, TrendingUp, Users } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Category Details',
        href: '#',
    },
];

export default function ShowCategory({ category }) {
    const formatCurrency = (amount) => {
        return `SSP ${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex items-center space-x-2">
                    <Link href="/categories">
                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                        <Tag className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{category.name}</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Category details and customer information</p>
                    <div className="mt-4">
                        <Link href={`/categories/${category.id}/edit`}>
                            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Category
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Pricing
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Customers
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Category Information */}
                        <div className="lg:col-span-1">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-blue-600" />
                                        Category Information
                                    </CardTitle>
                                    <CardDescription>Basic category details and pricing</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-4 w-4 text-slate-600" />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tariff Rate</span>
                                        </div>
                                        <span className="font-bold text-green-600">{formatCurrency(category.tariff)}</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-slate-600" />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price</span>
                                        </div>
                                        <span className="font-bold text-green-600">{formatCurrency(category.unit_price)}</span>
                                    </div>

                                    {category.fixed_charge > 0 && (
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                            <div className="flex items-center space-x-2">
                                                <Settings className="h-4 w-4 text-slate-600" />
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Fixed Charge</span>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(category.fixed_charge)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-slate-600" />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</span>
                                        </div>
                                        <span className="font-medium">{formatDate(category.created_at)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistics */}
                            <Card className="mt-6 border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        Statistics
                                    </CardTitle>
                                    <CardDescription>Category usage and customer counts</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</span>
                                        <Badge variant="outline" className="px-3 py-1 text-lg">
                                            {category.customers?.length || 0}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Customers</span>
                                        <Badge variant="secondary" className="px-3 py-1 text-lg">
                                            {category.customers?.filter((c) => c.is_active).length || 0}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Customers List */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        Customers in this Category
                                    </CardTitle>
                                    <CardDescription>All customers assigned to the {category.name} category</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {category.customers && category.customers.length > 0 ? (
                                        <div className="space-y-4">
                                            {category.customers.map((customer) => (
                                                <div
                                                    key={customer.id}
                                                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2">
                                                            <Users className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                                {customer.first_name} {customer.last_name}
                                                            </div>
                                                            <div className="text-sm text-slate-500">Account: {customer.account_number || 'N/A'}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                        {customer.phone && (
                                                            <div className="flex items-center space-x-1">
                                                                <Phone className="h-3 w-3" />
                                                                <span>{customer.phone}</span>
                                                            </div>
                                                        )}

                                                        {customer.email && (
                                                            <div className="flex items-center space-x-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{customer.email}</span>
                                                            </div>
                                                        )}

                                                        {customer.location && (
                                                            <div className="flex items-center space-x-1">
                                                                <MapPin className="h-3 w-3" />
                                                                <span>{customer.location.name}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            className={
                                                                customer.is_active
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }
                                                        >
                                                            {customer.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>

                                                        <Link href={`/customers/${customer.id}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                <Users className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No customers found</h3>
                                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                                This category doesn't have any customers assigned yet.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                Pricing Details
                            </CardTitle>
                            <CardDescription>Detailed pricing information for this category</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="py-12 text-center">
                                <DollarSign className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">Pricing details coming soon</p>
                                <p className="mt-2 text-sm text-slate-400">This will show detailed pricing breakdowns and charts.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                Customer Management
                            </CardTitle>
                            <CardDescription>Manage customers in this category</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="py-12 text-center">
                                <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">Customer management coming soon</p>
                                <p className="mt-2 text-sm text-slate-400">This will show advanced customer management features.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-orange-600" />
                                Analytics & Reports
                            </CardTitle>
                            <CardDescription>Category performance and analytics</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="py-12 text-center">
                                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">Analytics coming soon</p>
                                <p className="mt-2 text-sm text-slate-400">This will show detailed analytics and reports for this category.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
