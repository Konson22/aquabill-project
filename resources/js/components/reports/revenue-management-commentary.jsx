import { monthOverMonthPercentChange } from '@/components/reports/month-comparison-cell';
import { formatCompactNumber } from '@/lib/utils';
import { AlertTriangle, CalendarDays, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

/**
 * @param {{
 *   summary: {
 *     collection_rate_percent: number,
 *     total_billed_revenue: number,
 *     total_paid: number,
 *   },
 *   monthlyBreakdown?: Array<{
 *     label: string,
 *     amount_expected: number,
 *     payments_amount: number,
 *     bills_count: number,
 *   }>,
 *   collectionTargetPercent: number,
 * }} props
 */
export function RevenueManagementCommentary({ summary, monthlyBreakdown = [], collectionTargetPercent }) {
    const items = useMemo(() => {
        const target = Number(collectionTargetPercent ?? 90);
        const rate = Number(summary.collection_rate_percent ?? 0);
        const gap = Math.max(0, target - rate);
        const notes = [];

        if (gap > 0.5) {
            notes.push({
                key: 'gap',
                icon: AlertTriangle,
                iconClassName: 'text-violet-600 bg-violet-50',
                title: 'Collection gap',
                body: `Collection rate is ${rate.toFixed(1)}% — ${formatCompactNumber(summary.total_paid)} of ${formatCompactNumber(summary.total_billed_revenue)} SSP billed has been recovered. The target is ${target.toFixed(1)}% (gap ${gap.toFixed(1)} percentage points).`,
            });
        }

        const billingMonths = monthlyBreakdown.filter((row) => Number(row.amount_expected ?? 0) > 0);
        if (billingMonths.length === 1) {
            notes.push({
                key: 'billing-concentrated',
                icon: CalendarDays,
                iconClassName: 'text-amber-700 bg-amber-50',
                title: `Billing concentrated in ${billingMonths[0].label}`,
                body: `All billed revenue in this period was issued in ${billingMonths[0].label}. Review whether billing cycles are running on schedule for other months.`,
            });
        } else if (billingMonths.length > 1) {
            const top = [...billingMonths].sort(
                (a, b) => Number(b.amount_expected) - Number(a.amount_expected),
            )[0];
            notes.push({
                key: 'billing-mix',
                icon: CalendarDays,
                iconClassName: 'text-amber-700 bg-amber-50',
                title: 'Billing concentration',
                body: `${top.label} accounts for the largest share of bills generated (${formatCompactNumber(top.amount_expected)} SSP expected).`,
            });
        }

        const paymentMonths = monthlyBreakdown.filter((row) => Number(row.payments_amount ?? 0) > 0);
        const billingKeys = new Set(billingMonths.map((row) => row.label));
        const paymentsBeforeBilling = paymentMonths.some((row) => !billingKeys.has(row.label));
        if (paymentsBeforeBilling) {
            notes.push({
                key: 'payments-timing',
                icon: TrendingDown,
                iconClassName: 'text-sky-700 bg-sky-50',
                title: 'Payments outside billing months',
                body: 'Some collections occurred in months with little or no new billing — likely payments against arrears or prior balances.',
            });
        }

        for (let index = 1; index < monthlyBreakdown.length; index += 1) {
            const current = monthlyBreakdown[index];
            const previous = monthlyBreakdown[index - 1];
            const change = monthOverMonthPercentChange(
                Number(current.payments_amount ?? 0),
                Number(previous.payments_amount ?? 0),
            );

            if (change !== null && change >= 25) {
                notes.push({
                    key: `momentum-${current.label}`,
                    icon: TrendingUp,
                    iconClassName: 'text-emerald-700 bg-emerald-50',
                    title: `${current.label} recovery momentum`,
                    body: `Payments collected rose ${change.toFixed(1)}% compared with ${previous.label}.`,
                });
                break;
            }
        }

        if (notes.length === 0) {
            notes.push({
                key: 'steady',
                icon: TrendingUp,
                iconClassName: 'text-emerald-700 bg-emerald-50',
                title: 'Period summary',
                body: 'Collection performance is within expected range for the selected filters. Adjust the month or station filter to drill into specific periods.',
            });
        }

        return notes.slice(0, 4);
    }, [collectionTargetPercent, monthlyBreakdown, summary]);

    return (
        <aside className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Management commentary</h3>
            <ul className="mt-4 space-y-4">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.key} className="flex gap-3">
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}
                            >
                                <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
