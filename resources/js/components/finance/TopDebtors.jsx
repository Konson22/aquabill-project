import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, User } from 'lucide-react';

export default function TopDebtors({ data = [], limit = 5 }) {
    // Sort by outstanding amount and take top N
    const topDebtors = data.sort((a, b) => (b.outstandingAmount || 0) - (a.outstandingAmount || 0)).slice(0, limit);

    const getStatusColor = (amount) => {
        if (amount >= 10000) return 'text-red-600 dark:text-red-400';
        if (amount >= 5000) return 'text-orange-600 dark:text-orange-400';
        return 'text-yellow-600 dark:text-yellow-400';
    };

    const getStatusIcon = (amount) => {
        if (amount >= 10000) return <AlertTriangle className="h-4 w-4 text-red-500" />;
        return null;
    };

    if (topDebtors.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Top Debtors
                    </CardTitle>
                    <CardDescription>Customers with highest outstanding balances</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                        <div className="text-center">
                            <User className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No debtor data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Top Debtors
                </CardTitle>
                <CardDescription>Customers with highest outstanding balances</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topDebtors.map((debtor, index) => (
                        <div
                            key={debtor.id || index}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {debtor.customerName || debtor.name || 'Unknown Customer'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {debtor.customerId || debtor.id ? `#${debtor.customerId || debtor.id}` : 'No ID'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <p className={`font-bold ${getStatusColor(debtor.outstandingAmount || 0)}`}>
                                        SSP {(debtor.outstandingAmount || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {debtor.billCount || 0} {debtor.billCount === 1 ? 'bill' : 'bills'}
                                    </p>
                                </div>
                                {getStatusIcon(debtor.outstandingAmount || 0)}
                            </div>
                        </div>
                    ))}

                    {/* Summary */}
                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total Outstanding:</span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                SSP {topDebtors.reduce((sum, debtor) => sum + (debtor.outstandingAmount || 0), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
