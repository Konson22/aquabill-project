import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock, FileText, FileStack, Receipt } from 'lucide-react';
import RevenueChart from './RevenueChart';

export default function FinanceSection({
    stats,
    performance,
    invoices,
    waterRevenueChartData = [],
    paymentChartData = [],
}) {
    if (!stats || !invoices) return null;

    const rate = Math.min(100, Math.max(0, Number(performance) || 0));


    const items = [
        {
            label: 'Total Bills',
            value: stats.total ?? 0,
            icon: FileText,
            accent: 'text-slate-600',
            accentBg: 'bg-slate-500/10',
            cardBg: 'bg-slate-100 dark:bg-slate-800/60',
        },
        {
            label: 'Pending Bills',
            value: stats.pending ?? 0,
            icon: Clock,
            accent: 'text-amber-600',
            accentBg: 'bg-amber-500/10',
            cardBg: 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
            label: 'Total Invoices',
            value: invoices.total ?? 0,
            icon: FileStack,
            accent: 'text-blue-600',
            accentBg: 'bg-blue-500/10',
            cardBg: 'bg-blue-50 dark:bg-blue-950/30',
        },
        {
            label: 'Pending Invoices',
            value: invoices.unpaid ?? 0,
            icon: Receipt,
            accent: 'text-amber-600',
            accentBg: 'bg-amber-500/10',
            cardBg: 'bg-violet-50 dark:bg-violet-950/30',
        },
    ];


    return (
        <Card className="overflow-hidden border-0 bg-white shadow-sm dark:from-slate-900/50 dark:to-slate-900">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                    </span>
                    Billing & Revenue
                </CardTitle>
                <CardDescription>
                    Bills and invoices overview with revenue collected vs billed.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex space-x-4">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className={cn(
                                'flex items-center gap-3 flex-1 rounded-lg border border-transparent px-4 py-3 transition-colors',
                                item.cardBg,
                                'hover:border-slate-200 dark:hover:border-slate-600',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                    item.accentBg,
                                )}
                            >
                                <item.icon
                                    className={cn('h-5 w-5', item.accent)}
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xl font-bold tabular-nums text-foreground">
                                    {item.value}
                                </p>
                                <p className="truncate text-xs font-medium text-muted-foreground">
                                    {item.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <RevenueChart
                    data={waterRevenueChartData}
                    paymentsData={paymentChartData}
                />
            </CardContent>
        </Card>
    );
}
