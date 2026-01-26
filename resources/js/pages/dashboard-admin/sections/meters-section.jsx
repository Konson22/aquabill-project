import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    AlertTriangle,
    Ban,
    Gauge,
    Hammer,
    PowerOff,
} from 'lucide-react';

export default function MeterSection({ stats, trend }) {
    if (!stats) return null;

    const items = [
        {
            label: 'Active',
            value: stats.active,
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
            border: 'border-emerald-100 dark:border-emerald-900/50',
        },
        {
            label: 'Inactive',
            value: stats.inactive,
            icon: PowerOff,
            color: 'text-slate-600',
            bg: 'bg-slate-100 dark:bg-slate-900/20',
            border: 'border-slate-100 dark:border-slate-800',
        },
        {
            label: 'Maintenance',
            value: stats.maintenance,
            icon: Hammer,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            border: 'border-blue-100 dark:border-blue-900/50',
        },
        {
            label: 'Disconnected',
            value: stats.disconnected,
            icon: Ban,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
            border: 'border-amber-100 dark:border-amber-900/50',
        },
        {
            label: 'Damaged',
            value: stats.damage,
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/20',
            border: 'border-red-100 dark:border-red-900/50',
        },
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                    Meter Management
                </CardTitle>
                <Gauge className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex items-baseline space-x-2">
                    <div className="text-3xl font-bold">{stats.total}</div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Total Meters
                    </span>
                    {trend !== 0 && (
                        <span
                            className={`ml-2 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                            {trend > 0 ? '+' : ''}
                            {trend}% from last month
                        </span>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className={`flex flex-col rounded-xl border p-4 transition-all hover:shadow-sm ${item.bg} ${item.border}`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`rounded-lg bg-white/50 p-2 ${item.color}`}
                                >
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <span
                                    className={`text-sm font-medium ${item.color}`}
                                >
                                    {item.label}
                                </span>
                            </div>
                            <div
                                className={`mt-3 text-2xl font-bold ${item.color}`}
                            >
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
