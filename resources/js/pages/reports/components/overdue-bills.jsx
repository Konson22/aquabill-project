import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    CreditCard,
    TriangleAlert,
} from 'lucide-react';

/**
 * @param {string | undefined} dueDate
 * @returns {number | null}
 */
function daysOverdue(dueDate) {
    if (!dueDate) {
        return null;
    }
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return Number.isFinite(days) && days > 0 ? days : null;
}

/**
 * @param {{
 *   overdueBills?: Array<{
 *     id: number;
 *     due_date?: string | null;
 *     reference?: string;
 *     status?: string;
 *     current_balance?: number;
 *     total_amount?: number;
 *     customer_name?: string | null;
 *     account_number?: string | null;
 *   }>;
 *   overdueBillsMeta?: { total_count?: number; total_outstanding?: number };
 * }} props
 */
export function OverdueBills({ overdueBills = [], overdueBillsMeta }) {
    const meta = overdueBillsMeta ?? { total_count: 0, total_outstanding: 0 };
    const totalCount = Number(meta.total_count ?? 0);
    const totalOutstanding = Number(meta.total_outstanding ?? 0);
    const listed = overdueBills.length;
    const maxDays = overdueBills.reduce(
        (acc, row) => Math.max(acc, daysOverdue(row.due_date) ?? 0),
        0,
    );

    return (
        <Card className="overflow-hidden border-amber-200/60 shadow-sm dark:border-amber-900/40">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50/80 to-card pb-4 dark:from-amber-950/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                <TriangleAlert className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">Overdue bills</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground pl-11 sm:pl-0 max-w-xl">
                            Pending or partial bills whose due date has passed — same rules as the full overdue list.
                            Showing the oldest due dates first so the worst aging appears at the top.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 border-amber-200 bg-card hover:bg-amber-50/50 dark:border-amber-800" asChild>
                        <Link href={route('bills.overdue')}>
                            View all
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-lg border bg-card/80 px-3 py-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overdue count</div>
                            <div className="text-xl font-bold tabular-nums">{totalCount.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-card/80 px-3 py-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Outstanding</div>
                            <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-400">{formatCurrency(totalOutstanding)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-card/80 px-3 py-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Max days late (listed)</div>
                            <div className="text-xl font-bold tabular-nums">{listed ? maxDays.toLocaleString() : '—'}</div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {listed === 0 && totalCount === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <p className="font-medium text-foreground">No overdue bills right now</p>
                        <p className="max-w-md text-sm text-muted-foreground">
                            All pending and partial bills are still within their due window, or nothing is unpaid past due.
                        </p>
                    </div>
                ) : (
                    <>
                        {totalCount > listed ? (
                            <div className="border-b bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
                                Showing {listed.toLocaleString()} of {totalCount.toLocaleString()} overdue bills.
                                Open the full list for search, pagination, and payment workflow.
                            </div>
                        ) : null}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        <TableHead className="px-4 py-3">Invoice</TableHead>
                                        <TableHead className="px-4 py-3">Customer</TableHead>
                                        <TableHead className="px-4 py-3">Due date</TableHead>
                                        <TableHead className="px-4 py-3 text-right">Days late</TableHead>
                                        <TableHead className="px-4 py-3 text-right">Outstanding</TableHead>
                                        <TableHead className="w-[1%] px-4 py-3 text-right whitespace-nowrap" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overdueBills.map((row) => {
                                        const late = daysOverdue(row.due_date);

                                        return (
                                            <TableRow key={row.id} className="hover:bg-muted/30">
                                                <TableCell className="px-4 py-3">
                                                    <Link
                                                        href={route('bills.show', row.id)}
                                                        className="font-mono text-xs font-semibold text-primary hover:underline"
                                                    >
                                                        {row.reference ?? `#${String(row.id).padStart(6, '0')}`}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-foreground">{row.customer_name ?? '—'}</span>
                                                        <span className="text-xs text-muted-foreground">{row.account_number ?? ''}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                                                    {row.due_date ? new Date(row.due_date).toLocaleDateString() : '—'}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right">
                                                    {late ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-[10px] border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                                                        >
                                                            {late}d
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right font-mono text-sm font-semibold text-rose-700 dark:text-rose-400">
                                                    {formatCurrency(row.current_balance ?? 0)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="h-8" asChild>
                                                        <Link href={route('bills.show', row.id)}>Open</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
