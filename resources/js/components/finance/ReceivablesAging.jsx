import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

export default function ReceivablesAging({ data = [] }) {
    // Calculate aging buckets
    const agingBuckets = {
        '0-30': { amount: 0, count: 0, color: 'green' },
        '31-60': { amount: 0, count: 0, color: 'orange' },
        '61+': { amount: 0, count: 0, color: 'red' },
    };

    data.forEach((item) => {
        const daysOverdue = item.daysOverdue || 0;
        if (daysOverdue <= 30) {
            agingBuckets['0-30'].amount += item.amount || 0;
            agingBuckets['0-30'].count += 1;
        } else if (daysOverdue <= 60) {
            agingBuckets['31-60'].amount += item.amount || 0;
            agingBuckets['31-60'].count += 1;
        } else {
            agingBuckets['61+'].amount += item.amount || 0;
            agingBuckets['61+'].count += 1;
        }
    });

    const totalAmount = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

    const getColorClasses = (color) => {
        const colorMap = {
            green: {
                bg: 'bg-green-50 dark:bg-green-950',
                border: 'border-green-200 dark:border-green-800',
                text: 'text-green-600 dark:text-green-400',
                value: 'text-green-900 dark:text-green-100',
            },
            orange: {
                bg: 'bg-orange-50 dark:bg-orange-950',
                border: 'border-orange-200 dark:border-orange-800',
                text: 'text-orange-600 dark:text-orange-400',
                value: 'text-orange-900 dark:text-orange-100',
            },
            red: {
                bg: 'bg-red-50 dark:bg-red-950',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-600 dark:text-red-400',
                value: 'text-red-900 dark:text-red-100',
            },
        };
        return colorMap[color] || colorMap.green;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Receivables Aging
                </CardTitle>
                <CardDescription>Outstanding amounts by age</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">SSP {totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
                    </div>

                    {/* Aging Buckets */}
                    <div className="space-y-3">
                        {Object.entries(agingBuckets).map(([range, bucket]) => {
                            const colors = getColorClasses(bucket.color);
                            const percentage = totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;

                            return (
                                <div key={range} className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}>
                                    <div className="mb-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-3 w-3 rounded-full ${
                                                    bucket.color === 'green'
                                                        ? 'bg-green-500'
                                                        : bucket.color === 'orange'
                                                          ? 'bg-orange-500'
                                                          : 'bg-red-500'
                                                }`}
                                            />
                                            <span className={`font-medium ${colors.text}`}>{range} days</span>
                                        </div>
                                        <span className={`text-sm ${colors.text}`}>{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-lg font-bold ${colors.value}`}>SSP {bucket.amount.toLocaleString()}</p>
                                            <p className={`text-xs ${colors.text}`}>
                                                {bucket.count} {bucket.count === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        {bucket.color === 'red' && bucket.count > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Current</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <span>Overdue</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>Critical</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
