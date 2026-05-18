import { Card } from '@/components/ui/card';
import {
    MonthComparisonCell,
    monthOverMonthPercentChange,
} from '@/components/reports/month-comparison-cell';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * @param {number} payments
 * @param {number} expected
 */
function collectionRatePercent(payments, expected) {
    if (!expected || expected <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((payments / expected) * 1000) / 10);
}

/**
 * @param {number} payments
 * @param {number} expected
 */
function formatCollectionRate(payments, expected) {
    return `${collectionRatePercent(payments, expected).toLocaleString(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
    })}%`;
}

/**
 * @param {Array<{
 *   month: string,
 *   label: string,
 *   amount_expected: number,
 *   payments_amount: number,
 * }>} rows
 */
function monthlyRowsWithComparison(rows) {
    return rows.map((row, index) => {
        const previous = index > 0 ? rows[index - 1] : null;

        return {
            ...row,
            previousMonthLabel: previous?.label ?? null,
            paymentsChangePct: previous
                ? monthOverMonthPercentChange(row.payments_amount, previous.payments_amount)
                : null,
        };
    });
}

/**
 * @param {{
 *   monthlyBreakdown?: Array<{
 *     month: string,
 *     label: string,
 *     amount_expected: number,
 *     payments_amount: number,
 *   }>,
 *   year?: number,
 *   totals?: { amount_expected?: number, payments_amount?: number },
 * }} props
 */
export function RevenueMonthlyBreakdownTable({ monthlyBreakdown = [], year, totals }) {
    const displayYear = year ?? new Date().getFullYear();
    const monthlyRows = useMemo(() => monthlyRowsWithComparison(monthlyBreakdown), [monthlyBreakdown]);

    const footerTotals = useMemo(() => {
        if (totals) {
            return {
                amount_expected: totals.amount_expected ?? 0,
                payments_amount: totals.payments_amount ?? 0,
            };
        }

        return monthlyBreakdown.reduce(
            (acc, row) => ({
                amount_expected: acc.amount_expected + Number(row.amount_expected ?? 0),
                payments_amount: acc.payments_amount + Number(row.payments_amount ?? 0),
            }),
            { amount_expected: 0, payments_amount: 0 },
        );
    }, [monthlyBreakdown, totals]);

    const footerCollectionRate = collectionRatePercent(
        footerTotals.payments_amount,
        footerTotals.amount_expected,
    );

    return (
        <Card className="overflow-hidden border bg-card shadow-sm">
            <div className="border-b bg-card px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Payments and bills by month</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    <span className="text-foreground/80">Amount expected</span> is the total value of bills
                    generated that month (<span className="text-foreground/80">bill issue date</span>).{' '}
                    <span className="text-foreground/80">Collection rate</span> is payments collected divided by
                    that amount. Payments use <span className="text-foreground/80">payment date</span> (
                    {displayYear}).
                </p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="pl-5 font-semibold text-foreground">Month</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">
                            Amount of Bills Generated
                        </TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Payments collected</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Collection rate</TableHead>
                        <TableHead className="pr-5 text-right font-semibold text-foreground">
                            <span className="block">vs last month</span>
                            <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                                payments
                            </span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {monthlyRows.map((row) => (
                        <TableRow key={row.month}>
                            <TableCell className="pl-5 font-medium">{row.label}</TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                                {formatCurrency(row.amount_expected)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                                {formatCurrency(row.payments_amount)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm tabular-nums">
                                {formatCollectionRate(row.payments_amount, row.amount_expected)}
                            </TableCell>
                            <TableCell className="pr-5">
                                <MonthComparisonCell
                                    paymentsChangePct={row.paymentsChangePct}
                                    previousMonthLabel={row.previousMonthLabel}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    {monthlyRows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="py-12 text-center text-sm text-muted-foreground"
                            >
                                No months in this period.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                {monthlyRows.length > 0 && (
                    <tfoot>
                        <TableRow className="border-t bg-muted/20 font-semibold hover:bg-muted/20">
                            <TableCell className="pl-5">Total</TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                                {formatCurrency(footerTotals.amount_expected)}
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                                {formatCurrency(footerTotals.payments_amount)}
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums">
                                {footerCollectionRate.toLocaleString(undefined, {
                                    maximumFractionDigits: 1,
                                    minimumFractionDigits: 0,
                                })}
                                %
                            </TableCell>
                            <TableCell className="pr-5" />
                        </TableRow>
                    </tfoot>
                )}
            </Table>
        </Card>
    );
}
