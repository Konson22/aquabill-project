import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Edit, Eye, History, Plus, Printer, Search, Trash2 } from 'lucide-react';
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

    const formatDate = (date) => {
        if (!date) {
            return '—';
        }
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDelete = (categoryId) => {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            router.delete(`/categories/${categoryId}`);
        }
    };

    const handleFormSuccess = () => {
        setIsSheetOpen(false);
    };

    // Export to Excel functionality
    const exportToExcel = () => {
        const lines = [];
        lines.push('CATEGORIES EXPORT REPORT');
        lines.push('');
        lines.push(`Export Date: ${new Date().toLocaleString()}`);
        lines.push(`Total Categories: ${filteredCategories.length}`);
        lines.push('');

        lines.push('Category Name,Tariff Rate,Fixed Charge,Total Customers,Active Customers');
        filteredCategories.forEach((category) => {
            lines.push(
                `${category.name},${category.tariff},${category.fixed_charge},${category.customers_count || 0},${category.active_customers_count || 0}`,
            );
        });

        const BOM = '\uFEFF';
        const content = BOM + lines.join('\n');
        const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Print functionality
    const printReport = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Categories Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>CATEGORIES REPORT</h1>
        <div>Export Date: ${new Date().toLocaleString()}</div>
        <div>Total Categories: ${filteredCategories.length}</div>
    </div>
    
    <table>
        <thead>
            <tr><th>Category Name</th><th>Tariff Rate</th><th>Fixed Charge</th><th>Total Customers</th><th>Active Customers</th></tr>
        </thead>
        <tbody>
            ${filteredCategories
                .map(
                    (category) => `
                <tr>
                    <td>${category.name}</td>
                    <td>${formatSSPCurrency(category.tariff)}</td>
                    <td>${formatSSPCurrency(category.fixed_charge)}</td>
                    <td>${category.customers_count || 0}</td>
                    <td>${category.active_customers_count || 0}</td>
                </tr>
            `,
                )
                .join('')}
        </tbody>
    </table>
</body>
</html>`;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Categories</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Manage customer categories and pricing tiers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={route('categories.all-tariff-histories')}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            All Tariff Histories
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button>
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

            {/* Categories Table */}
            <Card>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Tariff Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Tariff Rate</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Fixed Charge</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Customers</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{category.name}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    {formatSSPCurrency(category.tariff)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="outline">{formatSSPCurrency(category.fixed_charge)}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant="secondary">{category.customers_count || 0}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{formatDate(category.created_at)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/categories/${category.id}`}>
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('categories.tariff-history', category.id)}>
                                                            <History className="mr-1 h-4 w-4" />
                                                            History
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/categories/${category.id}/edit`}>
                                                            <Edit className="mr-1 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                    >
                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Search className="mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm">No categories found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Results Count */}
                    {filteredCategories.length > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {filteredCategories.length} of {categories.length} categories
                                {searchQuery && <span className="ml-2 text-slate-500">(filtered by "{searchQuery}")</span>}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
