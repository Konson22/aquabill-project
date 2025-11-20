import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, History } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'All Tariff Histories',
        href: '#',
    },
];

export default function AllTariffHistories({ tariffHistories }) {
    const formatCurrency = (amount) => {
        return `SSP ${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    const getDateRange = (history, index, allHistories) => {
        const fromDate = formatDate(history.created_at);

        // Find all histories for the same category, sorted by created_at descending
        const categoryHistories = allHistories
            .filter((h) => h.category_id === history.category_id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const currentIndex = categoryHistories.findIndex((h) => h.id === history.id);

        // If it's the most recent entry for this category (index 0), show "Present"
        if (currentIndex === 0) {
            return `${fromDate} - Present`;
        }

        // Otherwise, show the previous entry's date as the end date
        const previousHistory = categoryHistories[currentIndex - 1];
        const toDate = formatDate(previousHistory.created_at);
        return `${fromDate} - ${toDate}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Tariff Histories" />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/categories">
                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-500 to-slate-700">
                        <History className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">All Tariff Histories</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Complete pricing change log across all categories</p>
                </div>
            </div>

            {/* Tariff Histories Content */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-600" />
                        All Tariff Changes
                    </CardTitle>
                    <CardDescription>Complete pricing change log across all categories</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {tariffHistories && tariffHistories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Category</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Unit Price</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Fixed Charge</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Updated By</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Date Range</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {tariffHistories.map((history, index) => (
                                        <tr key={history.id ?? index} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                                    {history.category?.name || 'Unknown Category'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {formatCurrency(history.unit_price)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-slate-900 dark:text-slate-100">{formatCurrency(history.fixed_charge)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-slate-600 dark:text-slate-400">{history.changed_by?.name || 'System'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {getDateRange(history, index, tariffHistories)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {history.category?.id && (
                                                    <Link href={`/categories/${history.category.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <History className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No tariff history found</h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Pricing updates across all categories will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
