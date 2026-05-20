import { cn, formatCompactNumber } from '@/lib/utils';
import { Droplets, Wrench } from 'lucide-react';

/**
 * @param {number} amount
 */
function formatSspCompact(amount) {
    return `${formatCompactNumber(amount)} SSP`;
}

/**
 * @param {number} paid
 * @param {number} billed
 */
function collectionRatio(paid, billed) {
    if (!billed || billed <= 0) {
        return 0;
    }

    return Math.min(100, (paid / billed) * 100);
}

/**
 * @param {{
 *   title: string,
 *   icon: import('react').ReactNode,
 *   collected: number,
 *   billed: number,
 *   barClassName: string,
 * }} props
 */
function StreamCard({ title, icon, collected, billed, barClassName }) {
    const ratio = collectionRatio(collected, billed);

    return (
        <div className="flex flex-col rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {icon}
                {title}
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatSspCompact(collected)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Billed: {formatSspCompact(billed)}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full rounded-full transition-all', barClassName)} style={{ width: `${ratio}%` }} />
            </div>
        </div>
    );
}

/**
 * @param {{
 *   summary: {
 *     total_revenue: number,
 *     total_revenue_paid: number,
 *     fixed_charge_revenue: number,
 *     fixed_charge_paid: number,
 *     service_charges_revenue: number,
 *     service_charges_paid: number,
 *     total_paid?: number,
 *   },
 * }} props
 */
export function RevenueStreamCards({ summary }) {
    const billRevenueCollected =
        Number(summary.total_revenue_paid ?? 0) + Number(summary.fixed_charge_paid ?? 0);
    const billRevenueBilled = Number(summary.total_revenue ?? 0) + Number(summary.fixed_charge_revenue ?? 0);
    const serviceChargesCollected = Number(summary.service_charges_paid ?? 0);
    const serviceChargesBilled = Number(summary.service_charges_revenue ?? 0);

    return (
        <section className="space-y-3" aria-labelledby="revenue-streams-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="revenue-streams-heading" className="text-sm font-semibold text-foreground">
                    Collected revenue by stream
                </h2>
                <p className="text-xs text-muted-foreground">
                    Total collected:{' '}
                    <span className="font-semibold tabular-nums text-foreground">
                        {formatSspCompact(billRevenueCollected + serviceChargesCollected)}
                    </span>
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StreamCard
                    title="Bill revenue collected"
                    icon={<Droplets className="h-4 w-4 text-sky-600" aria-hidden />}
                    collected={billRevenueCollected}
                    billed={billRevenueBilled}
                    barClassName="bg-sky-600"
                />
                <StreamCard
                    title="Service charges collected"
                    icon={<Wrench className="h-4 w-4 text-amber-600" aria-hidden />}
                    collected={serviceChargesCollected}
                    billed={serviceChargesBilled}
                    barClassName="bg-amber-600"
                />
            </div>
        </section>
    );
}
