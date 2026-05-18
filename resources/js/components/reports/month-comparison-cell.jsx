import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

/**
 * @param {number} current
 * @param {number} previous
 * @returns {number | null}
 */
export function monthOverMonthPercentChange(current, previous) {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return ((current - previous) / previous) * 100;
}

/**
 * @param {number | null} percent
 */
function formatMonthComparison(percent) {
    if (percent === null) {
        return '';
    }

    const rounded = Number(percent.toFixed(1));
    const sign = rounded > 0 ? '+' : '';

    return `${sign}${rounded}%`;
}

/**
 * @param {{ label: string, percent: number | null, className?: string }} props
 */
function ComparisonBadge({ label, percent, className }) {
    if (percent === null) {
        return null;
    }

    const rounded = Number(percent.toFixed(1));
    const isUp = rounded > 0;
    const isDown = rounded < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    const formatted = formatMonthComparison(rounded);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none tabular-nums',
                isUp &&
                    'border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
                isDown &&
                    'border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
                !isUp && !isDown && 'border-border bg-muted/40 text-muted-foreground',
                className,
            )}
            title={`${label}: ${formatted} vs previous month`}
        >
            <span className="sr-only">{label} </span>
            <Icon className="h-3 w-3 shrink-0" aria-hidden />
            {formatted}
        </span>
    );
}

/**
 * @param {{
 *   expectedChangePct?: number | null,
 *   paymentsChangePct?: number | null,
 *   forwardedChangePct?: number | null,
 *   billsChangePct?: number | null,
 *   previousMonthLabel?: string | null,
 *   expectedLabel?: string,
 *   paymentsLabel?: string,
 *   forwardedLabel?: string,
 *   billsLabel?: string,
 * }} props
 */
export function MonthComparisonCell({
    expectedChangePct = null,
    paymentsChangePct = null,
    forwardedChangePct = null,
    billsChangePct = null,
    previousMonthLabel,
    expectedLabel = 'Expected',
    paymentsLabel = 'Payments',
    forwardedLabel = 'Forwarded',
    billsLabel = 'Bills',
}) {
    const hasComparison =
        expectedChangePct !== null ||
        paymentsChangePct !== null ||
        forwardedChangePct !== null ||
        billsChangePct !== null;

    if (!hasComparison) {
        return (
            <div className="flex justify-end">
                <span className="text-sm text-muted-foreground" title="First month in selected range">
                    —
                </span>
            </div>
        );
    }

    const groupLabel = previousMonthLabel
        ? `Change compared with ${previousMonthLabel}`
        : 'Change compared with previous month';

    return (
        <div
            className="flex flex-wrap items-center justify-end gap-1"
            role="group"
            aria-label={groupLabel}
            title={groupLabel}
        >
            <ComparisonBadge label={expectedLabel} percent={expectedChangePct} />
            <ComparisonBadge label={paymentsLabel} percent={paymentsChangePct} />
            <ComparisonBadge label={forwardedLabel} percent={forwardedChangePct} />
            <ComparisonBadge
                label={billsLabel}
                percent={billsChangePct}
                className="ring-1 ring-border/50 ring-inset"
            />
        </div>
    );
}
