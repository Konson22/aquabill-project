import { formatCompactNumber } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

/**
 * @param {{
 *   summary: {
 *     collection_rate_percent: number,
 *     total_paid: number,
 *     total_billed_revenue: number,
 *   },
 *   monthlyBreakdown?: Array<{ label: string, amount_expected: number }>,
 *   collectionTargetPercent: number,
 *   periodLabel?: string,
 * }} props
 */
export function RevenueCollectionAlert({
    summary,
    monthlyBreakdown = [],
    collectionTargetPercent,
    periodLabel = 'year to date',
}) {
    const message = useMemo(() => {
        const rate = Number(summary.collection_rate_percent ?? 0);
        const target = Number(collectionTargetPercent ?? 90);
        const billingMonths = monthlyBreakdown.filter((row) => Number(row.amount_expected ?? 0) > 0);
        let billingNote = '';

        if (billingMonths.length === 1) {
            billingNote = ` Billing activity has only occurred in ${billingMonths[0].label}.`;
        } else if (billingMonths.length === 0) {
            billingNote = ' No billing activity recorded in this period.';
        }

        return `Collection rate is ${rate.toFixed(1)}% — only ${formatCompactNumber(summary.total_paid)} of ${formatCompactNumber(summary.total_billed_revenue)} SSP billed has been recovered ${periodLabel}. The target is ${target.toFixed(1)}%.${billingNote}`;
    }, [collectionTargetPercent, monthlyBreakdown, periodLabel, summary]);

    const rate = Number(summary.collection_rate_percent ?? 0);
    const target = Number(collectionTargetPercent ?? 90);

    if (rate >= target) {
        return null;
    }

    return (
        <div
            className="flex gap-3 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100"
            role="alert"
        >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
            <p className="leading-relaxed">{message}</p>
        </div>
    );
}
