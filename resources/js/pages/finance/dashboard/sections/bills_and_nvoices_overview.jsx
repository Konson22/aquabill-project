import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Clock,
    FileText,
    PieChart,
} from 'lucide-react';

export default function BillsAndNvoicesOverview({ stats }) {
    const billItems = [
        {
            label: 'Pending',
            value: stats.billStats.pending || 0,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
        },
        {
            label: 'Partial / Fwd / Bal',
            value:
                (stats.billStats.partial_paid || 0) +
                (stats.billStats.forwarded || 0) +
                (stats.billStats.balance_forwarded || 0),
            icon: PieChart,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            label: 'Overdue',
            value: stats.billStats.overdue || 0,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/20',
        },
    ];

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        Billing Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                        {billItems.map((item) => (
                            <div
                                key={item.label}
                                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-muted/30 p-4 transition-all duration-300 hover:border-border hover:bg-background hover:shadow-xl dark:bg-card/50"
                            >
                                <div className="relative z-10 flex gap-4">
                                    <div
                                        className={cn(
                                            'w-fit rounded-xl p-2.5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6',
                                            item.bg,
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-5 w-5',
                                                item.color,
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-1">
                                            {item.value}
                                        </div>
                                        <div className="mt-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40',
                                        item.bg,
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
