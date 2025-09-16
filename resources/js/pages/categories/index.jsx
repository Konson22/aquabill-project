import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, DollarSign, Edit, Eye, Filter, Plus, Search, Settings, Tag, Trash2, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';
import CategoryForm from '../forms/category-form';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
];

export default function CategoriesPage({ categories }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState(categories);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [filteredStats, setFilteredStats] = useState({
        total_categories: categories.length,
        total_customers: categories.reduce((sum, cat) => sum + (cat.customers_count || 0), 0),
        active_customers: categories.reduce((sum, cat) => sum + (cat.active_customers_count || 0), 0),
        avg_tariff:
            categories.length > 0 ? (categories.reduce((sum, cat) => sum + parseFloat(cat.tariff || 0), 0) / categories.length).toFixed(2) : 0,
    });

    // Filter categories based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCategories(categories);
            setFilteredStats({
                total_categories: categories.length,
                total_customers: categories.reduce((sum, cat) => sum + (cat.customers_count || 0), 0),
                active_customers: categories.reduce((sum, cat) => sum + (cat.active_customers_count || 0), 0),
                avg_tariff:
                    categories.length > 0
                        ? (categories.reduce((sum, cat) => sum + parseFloat(cat.tariff || 0), 0) / categories.length).toFixed(2)
                        : 0,
            });
        } else {
            const filtered = categories.filter((category) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in category name
                const name = category.name?.toLowerCase() || '';
                if (name.includes(searchLower)) return true;

                // Search in tariff
                const tariff = category.tariff?.toString() || '';
                if (tariff.includes(searchLower)) return true;

                // Search in fixed charge
                const fixedCharge = category.fixed_charge?.toString() || '';
                if (fixedCharge.includes(searchLower)) return true;

                return false;
            });

            setFilteredCategories(filtered);
            setFilteredStats({
                total_categories: filtered.length,
                total_customers: filtered.reduce((sum, cat) => sum + (cat.customers_count || 0), 0),
                active_customers: filtered.reduce((sum, cat) => sum + (cat.active_customers_count || 0), 0),
                avg_tariff:
                    filtered.length > 0 ? (filtered.reduce((sum, cat) => sum + parseFloat(cat.tariff || 0), 0) / filtered.length).toFixed(2) : 0,
            });
        }
    }, [searchQuery, categories]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleDelete = (categoryId) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            router.delete(`/categories/${categoryId}`);
        }
    };

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Categories</h1>
                        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Manage customer categories and pricing tiers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <CategoryForm onSuccess={handleFormSuccess} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Categories</CardTitle>
                        <div className="rounded-full bg-blue-500 p-2">
                            <Tag className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{filteredStats.total_categories}</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">All categories</p>
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-200/30 dark:bg-blue-800/30"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Total Customers</CardTitle>
                        <div className="rounded-full bg-green-500 p-2">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-900 dark:text-green-100">{filteredStats.total_customers}</div>
                        <p className="text-sm text-green-700 dark:text-green-300">All customers</p>
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-green-200/30 dark:bg-green-800/30"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Active Customers</CardTitle>
                        <div className="rounded-full bg-purple-500 p-2">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{filteredStats.active_customers}</div>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Currently active</p>
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-200/30 dark:bg-purple-800/30"></div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Avg. Tariff</CardTitle>
                        <div className="rounded-full bg-orange-500 p-2">
                            <DollarSign className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{formatCurrency(filteredStats.avg_tariff)}</div>
                        <p className="text-sm text-orange-700 dark:text-orange-300">Average rate</p>
                        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-orange-200/30 dark:bg-orange-800/30"></div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content with Tabs */}
            <Tabs defaultValue="all" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="all" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            All Categories
                        </TabsTrigger>
                        <TabsTrigger value="popular" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Popular
                        </TabsTrigger>
                        <TabsTrigger value="recent" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Recent
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-80">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <TabsContent value="all" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">All Categories</CardTitle>
                                    <CardDescription className="text-base">Manage customer categories and pricing information</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-sm">
                                        {filteredCategories.length} categories
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {filteredCategories.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredCategories.map((category, index) => {
                                        const colors = [
                                            'from-blue-500 to-blue-600',
                                            'from-green-500 to-green-600',
                                            'from-purple-500 to-purple-600',
                                            'from-orange-500 to-orange-600',
                                            'from-pink-500 to-pink-600',
                                            'from-indigo-500 to-indigo-600',
                                        ];
                                        const bgColors = [
                                            'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
                                            'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
                                            'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
                                            'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
                                            'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20',
                                            'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20',
                                        ];
                                        const colorClass = colors[index % colors.length];
                                        const bgClass = bgColors[index % bgColors.length];

                                        return (
                                            <Card
                                                key={category.id}
                                                className={`group relative overflow-hidden border-0 bg-gradient-to-br ${bgClass} transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-slate-900/50"></div>
                                                <CardHeader className="relative pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`rounded-xl bg-gradient-to-r ${colorClass} p-2`}>
                                                                <Tag className="h-5 w-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                                    {category.name}
                                                                </CardTitle>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400">Customer Category</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary" className="text-xs font-medium">
                                                            {category.customers_count} customers
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="relative space-y-4">
                                                    {/* Pricing Information */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between rounded-lg bg-white/50 p-3 dark:bg-slate-800/50">
                                                            <div className="flex items-center space-x-2">
                                                                <DollarSign className="h-4 w-4 text-slate-600" />
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                                    Tariff Rate
                                                                </span>
                                                            </div>
                                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                                {formatSSPCurrency(category.tariff)}
                                                            </span>
                                                        </div>

                                                        {category.fixed_charge > 0 && (
                                                            <div className="flex items-center justify-between rounded-lg bg-white/50 p-3 dark:bg-slate-800/50">
                                                                <div className="flex items-center space-x-2">
                                                                    <Settings className="h-4 w-4 text-slate-600" />
                                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                                        Fixed Charge
                                                                    </span>
                                                                </div>
                                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                                    {formatSSPCurrency(category.fixed_charge)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex space-x-2 pt-2">
                                                        <Link href={`/categories/${category.id}`} className="flex-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/categories/${category.id}/edit`} className="flex-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                                                            >
                                                                <Edit className="mr-1 h-3 w-3" />
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(category.id)}
                                                            className="flex-1 bg-white/80 text-red-600 hover:bg-red-50 hover:text-red-700 dark:bg-slate-800/80 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </CardContent>

                                                {/* Decorative elements */}
                                                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/20 dark:bg-slate-800/20"></div>
                                                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 dark:bg-slate-800/10"></div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                        <Search className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No categories found</h3>
                                    {searchQuery ? (
                                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                                            No categories match your search for "{searchQuery}". Try adjusting your search terms.
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-slate-600 dark:text-slate-400">Get started by creating your first category.</p>
                                    )}
                                </div>
                            )}

                            {/* Results Count */}
                            {filteredCategories.length > 0 && (
                                <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        Showing {filteredCategories.length} of {categories.length} categories
                                        {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="popular" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Popular Categories</CardTitle>
                                    <CardDescription className="text-base">Most used customer categories</CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    Coming Soon
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="py-16 text-center">
                                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">Popular categories feature coming soon</p>
                                <p className="mt-2 text-sm text-slate-400">This will show the most frequently used categories.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recent" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Recent Categories</CardTitle>
                                    <CardDescription className="text-base">Recently created or updated categories</CardDescription>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    Coming Soon
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="py-16 text-center">
                                <Activity className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-500">Recent categories feature coming soon</p>
                                <p className="mt-2 text-sm text-slate-400">This will show recently created or updated categories.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
