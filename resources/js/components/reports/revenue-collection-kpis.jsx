import { cn, formatCompactNumber } from '@/lib/utils';

/**
 * @param {number} amount
 */
function formatSspCompact(amount) {
    return `${formatCompactNumber(amount)} SSP`;
}

/**
 * @param {{
 *   title: string,
 *   value: string,
 *   subtitle?: string,
 *   valueClassName?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
function KpiCard({ title, value, subtitle, valueClassName, children }) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('mt-2 text-3xl font-bold tracking-tight tabular-nums', valueClassName)}>{value}</p>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
            {children}
        </div>
    );
}

/**
 * @param {number} paid
 * @param {number} billed
 */
function collectionRatePercent(paid, billed) {
    if (!billed || billed <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((paid / billed) * 1000) / 10);
}

/**
 * @param {{
 *   summary: {
 *     total_paid: number,
 *     total_billed_revenue: number,
 *     total_outstanding: number,
 *   },
 * }} props
 */
export function RevenueCollectionKpis({ summary }) {
    const paid = Number(summary.total_paid ?? 0);
    const billed = Number(summary.total_billed_revenue ?? 0);
    const rate = collectionRatePercent(paid, billed);
    const progressWidth = Math.min(100, rate);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
                title="Total billed"
                value={formatSspCompact(summary.total_billed_revenue)}
                subtitle="SSP water usage + fixed charges on bills"
                valueClassName="text-slate-900 dark:text-slate-100"
            />
            <KpiCard
                title="Total collected"
                value={formatSspCompact(summary.total_paid)}
                subtitle="SSP bill payments in period (excludes service charges)"
                valueClassName="text-emerald-700 dark:text-emerald-400"
            />
            <KpiCard
                title="Outstanding balance"
                value={formatSspCompact(summary.total_outstanding)}
                subtitle="SSP total billed minus total collected"
                valueClassName="text-red-800 dark:text-red-300"
            />
            <KpiCard
                title="Collection rate"
                value={`${rate.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                valueClassName="text-red-700 dark:text-red-400"
            >
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${progressWidth}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    {formatSspCompact(paid)} collected of {formatSspCompact(billed)} billed
                </p>
            </KpiCard>
        </div>
    );
}
