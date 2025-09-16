import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { DollarSign, Edit, Eye, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChargeForm from '../forms/charge-form';

const breadcrumbs = [
    {
        title: 'Charges',
        href: '/charges',
    },
];

export default function ChargesPage({ charges }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCharges, setFilteredCharges] = useState(charges);
    const [filteredStats, setFilteredStats] = useState({
        total_charges: charges.length,
        total_amount: charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0),
        avg_amount: charges.length > 0 ? (charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0) / charges.length).toFixed(2) : 0,
        categorized_charges: charges.filter(charge => charge.category_id).length,
    });

    // Filter charges based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCharges(charges);
            setFilteredStats({
                total_charges: charges.length,
                total_amount: charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0),
                avg_amount: charges.length > 0 ? (charges.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0) / charges.length).toFixed(2) : 0,
                categorized_charges: charges.filter(charge => charge.category_id).length,
            });
        } else {
            const filtered = charges.filter((charge) => {
                const searchLower = searchQuery.toLowerCase();

                // Search in description
                const description = charge.description?.toLowerCase() || '';
                if (description.includes(searchLower)) return true;

                // Search in charge amount
                const amount = charge.charge_amount?.toString() || '';
                if (amount.includes(searchLower)) return true;

                // Search in category name
                const categoryName = charge.category?.name?.toLowerCase() || '';
                if (categoryName.includes(searchLower)) return true;

                return false;
            });

            setFilteredCharges(filtered);
            setFilteredStats({
                total_charges: filtered.length,
                total_amount: filtered.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0),
                avg_amount: filtered.length > 0 ? (filtered.reduce((sum, charge) => sum + parseFloat(charge.charge_amount || 0), 0) / filtered.length).toFixed(2) : 0,
                categorized_charges: filtered.filter(charge => charge.category_id).length,
            });
        }
    }, [searchQuery, charges]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleDelete = (chargeId) => {
        if (confirm('Are you sure you want to delete this charge? This action cannot be undone.')) {
            router.delete(`/charges/${chargeId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Charges" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Charges</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage additional charges and fees</p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Charge
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <ChargeForm />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
                        <Tag className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.total_charges}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">All charges</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(filteredStats.total_amount)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Combined value</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(filteredStats.avg_amount)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Per charge</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorized</CardTitle>
                        <Tag className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredStats.categorized_charges}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">With categories</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Charges Grid */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Charges</CardTitle>
                            <CardDescription>Manage additional charges and fees</CardDescription>
                        </div>
                        <div className="relative w-80">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search charges..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCharges.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCharges.map((charge) => (
                                <Card key={charge.id} className="transition-shadow duration-200 hover:shadow-lg">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                <CardTitle className="text-lg">{formatCurrency(charge.charge_amount)}</CardTitle>
                                            </div>
                                            {charge.category && (
                                                <Badge variant="outline" className="text-xs">
                                                    {charge.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Description */}
                                        {charge.description && (
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {charge.description}
                                            </div>
                                        )}

                                        {/* Category Info */}
                                        <div className="text-xs text-slate-500">
                                            {charge.category ? (
                                                <span>Category: {charge.category.name}</span>
                                            ) : (
                                                <span className="text-slate-400">No category assigned</span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 pt-2">
                                            <Link href={`/charges/${charge.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/charges/${charge.id}/edit`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(charge.id)}
                                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <DollarSign className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-lg font-medium text-slate-500">No charges found</p>
                            {searchQuery ? (
                                <p className="mt-2 text-sm text-slate-400">
                                    No charges match your search for "{searchQuery}". Try adjusting your search terms.
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-slate-400">Get started by creating your first charge.</p>
                            )}
                        </div>
                    )}

                    {/* Results Count */}
                    {filteredCharges.length > 0 && (
                        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {filteredCharges.length} of {charges.length} charges
                                {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
