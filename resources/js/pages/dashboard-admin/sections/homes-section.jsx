import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Home, XCircle } from 'lucide-react';

export default function HomesSection({ stats, trend }) {
    if (!stats) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Total Connections
                </CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                        {trend > 0 ? '+' : ''}
                        {trend}% from last month
                    </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Active</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {stats.active}
                        </div>
                    </div>

                    <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Suspended
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {stats.suspended}
                        </div>
                    </div>

                    <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Disconnected
                            </span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
                            {stats.disconnected}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
