import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, Edit, Eye, History, Mail, MapPin, Phone, Settings, Tag, TrendingUp, Users } from 'lucide-react';

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
        if (!date) {
            return '—';
        }

        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />

            {/* Back Button */}
            <div className="mb-6">
                <Link href="/categories">
                    <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Categories
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Current Tariff Information */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Tag className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-white">{category.name}</CardTitle>
                                </div>
                                <CardDescription className="mt-2 text-blue-100">Current pricing information and category details</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/categories/${category.id}/edit`}>
                                    <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 dark:bg-white dark:text-blue-700">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Link href={route('categories.tariff-history', category.id)}>
                                    <Button variant="outline" size="sm" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                                        <History className="mr-2 h-4 w-4" />
                                        History
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-green-100 p-4 dark:border-slate-800 dark:from-green-900/20 dark:to-green-800/20">
                                <div className="mb-2 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tariff Rate</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(category.tariff)}</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:border-slate-800 dark:from-blue-900/20 dark:to-blue-800/20">
                                <div className="mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(category.unit_price)}</p>
                            </div>

                            {category.fixed_charge > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:border-slate-800 dark:from-purple-900/20 dark:to-purple-800/20">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Fixed Charge</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(category.fixed_charge)}</p>
                                </div>
                            )}

                            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:border-slate-800 dark:from-slate-900/20 dark:to-slate-800/20">
                                <div className="mb-2 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</span>
                                </div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDate(category.created_at)}</p>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Customers</span>
                                    <Badge variant="outline" className="px-3 py-1 text-lg font-semibold">
                                        {category.customers?.length || 0}
                                    </Badge>
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Customers</span>
                                    <Badge variant="secondary" className="px-3 py-1 text-lg font-semibold">
                                        {category.customers?.filter((c) => c.is_active).length || 0}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customers List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Customers
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
                                                <Button variant="outline" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
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
                                <p className="mt-2 text-slate-600 dark:text-slate-400">This category doesn't have any customers assigned yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
