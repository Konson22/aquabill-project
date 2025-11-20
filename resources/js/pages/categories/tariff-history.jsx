import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Category Details',
        href: '#',
    },
    {
        title: 'Tariff History',
        href: '#',
    },
];

export default function TariffHistory({ category, tariffHistories }) {
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

    const getDateRange = (history, index) => {
        const fromDate = formatDate(history.created_at);

        // If it's the most recent entry (index 0), show "Present" as the end date
        if (index === 0) {
            return `${fromDate} - Present`;
        }

        // Otherwise, show the previous (newer) entry's date as the end date
        // Since array is sorted descending, index - 1 is the newer entry
        const previousHistory = tariffHistories[index - 1];
        const toDate = formatDate(previousHistory.created_at);
        return `${fromDate} - ${toDate}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tariff History: ${category.name}`} />

            {/* Tariff History Content */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20">
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-slate-600" />
                        Tariff Change Log
                    </CardTitle>
                    <CardDescription>Track all pricing updates for {category.name}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    {tariffHistories && tariffHistories.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">#</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Unit Price</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Fixed Charge</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Updated By</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Date Range</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {tariffHistories.map((history, index) => (
                                        <tr key={history.id ?? index} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="text-sm">
                                                    #{tariffHistories.length - index}
                                                </Badge>
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
                                                <span className="text-sm text-slate-500 dark:text-slate-400">{getDateRange(history, index)}</span>
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
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No tariff history yet</h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">Updates to this category's pricing will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
