import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Activity,
    CircleDollarSign,
    Clock,
    FileText,
    PieChart,
    Receipt,
} from 'lucide-react';

export default function FinanceSection({ stats, performance, invoices }) {
    if (!stats || !invoices) return null;

    const items = [
        {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100 dark:bg-amber-900/20',
        },
        {
            label: 'Fully Paid',
            value: stats.fully_paid,
            icon: CircleDollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100 dark:bg-emerald-900/20',
        },
        {
            label: 'Partial / Fwd',
            value: stats.partial_paid + stats.forwarded,
            icon: PieChart,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            label: 'Bal Forwarded',
            value: stats.balance_forwarded,
            icon: Receipt,
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    const invoiceItems = [
        {
            label: 'Total',
            value: invoices.total,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
        },
        {
            label: 'Paid',
            value: invoices.paid,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
        {
            label: 'Unpaid',
            value: invoices.unpaid,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 lg:col-span-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-500" />
                            Billing Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
                            {items.map((item) => (
                                <div
                                    key={item.label}
                                    className="group relative flex flex-col items-center justify-center space-y-3 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div
                                        className={cn(
                                            'bg-opacity-10 rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110',
                                            item.bg,
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-6 w-6',
                                                item.color,
                                            )}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                            {item.value}
                                        </div>
                                        <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                            {item.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <h3 className="mb-4 flex items-center gap-2 leading-none font-semibold tracking-tight">
                                <Activity className="h-5 w-5 text-slate-500" />
                                Invoices Overview
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {invoiceItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="group flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className="text-sm font-medium text-slate-500">
                                                {item.label} Invoices
                                            </span>
                                            <div
                                                className={cn(
                                                    'h-3 w-3 rounded-full shadow-sm',
                                                    item.color.replace(
                                                        'text-',
                                                        'bg-',
                                                    ),
                                                )}
                                            />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className={cn(
                                                    'text-3xl font-bold tracking-tight',
                                                    item.color,
                                                )}
                                            >
                                                {item.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Billing Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800">
                            <div
                                className="absolute inset-0 rounded-full border-8 border-emerald-500 transition-all duration-1000 ease-out"
                                style={{
                                    clipPath: `inset(0 0 ${100 - performance}% 0)`,
                                }}
                            />
                            <div className="flex flex-col items-center text-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                    {performance}%
                                </span>
                                <span className="text-xs text-slate-500">
                                    Bills Collected
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 flex w-full items-center justify-between text-sm text-slate-500">
                            <span>Total Bills Issued</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {stats.total}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
