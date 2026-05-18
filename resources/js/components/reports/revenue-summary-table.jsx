import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn, formatCurrency } from '@/lib/utils';

/** @typedef {{ total_revenue: number, total_revenue_paid?: number, total_revenue_unpaid?: number, fixed_charge_revenue: number, fixed_charge_paid?: number, fixed_charge_unpaid?: number, service_charges_revenue?: number, service_charges_paid?: number, service_charges_unpaid?: number, total_billed_revenue: number, total_paid: number, total_outstanding: number, collection_rate_percent: number, total_bills_generated?: number, bills_paid_count?: number, bills_pending_count?: number, bills_forwarded_count?: number }} RevenueSummary */

/** @typedef {{ from?: string, to?: string, search?: string }} RevenueSummaryFilters */

/**
 * @param {string | undefined} iso
 * @returns {string | null}
 */
function formatFilterDate(iso) {
    const raw = typeof iso === 'string' ? iso.trim() : '';
    if (!raw) {
        return null;
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
        return raw;
    }

    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * @param {RevenueSummaryFilters | undefined} filters
 */
function summaryPeriodLabel(filters) {
    const from = filters?.from?.trim() ?? '';
    const to = filters?.to?.trim() ?? '';
    const fromLabel = formatFilterDate(from);
    const toLabel = formatFilterDate(to);

    let range;
    if (fromLabel && toLabel) {
        range = `${fromLabel} – ${toLabel}`;
    } else if (fromLabel) {
        range = `From ${fromLabel}`;
    } else if (toLabel) {
        range = `Through ${toLabel}`;
    } else {
        range = 'Full calendar year (set dates)';
    }

    const q = filters?.search?.trim();
    if (!q) {
        return range;
    }

    const short = q.length > 48 ? `${q.slice(0, 45)}…` : q;

    return `${range} · Customer search: “${short}”`;
}

/** Mirrors backend: sum of Bill.current_charge (water / usage charges only; not fixed fees or arrears). */
const defaultSummary = {
    total_revenue: 0,
    total_revenue_paid: 0,
    total_revenue_unpaid: 0,
    fixed_charge_revenue: 0,
    fixed_charge_paid: 0,
    fixed_charge_unpaid: 0,
    service_charges_revenue: 0,
    service_charges_paid: 0,
    service_charges_unpaid: 0,
    total_billed_revenue: 0,
    total_paid: 0,
    total_outstanding: 0,
    collection_rate_percent: 0,
    total_bills_generated: 0,
    bills_paid_count: 0,
    bills_pending_count: 0,
    bills_forwarded_count: 0,
};

/**
 * @param {number | null | undefined} value
 * @param {'currency' | 'percent' | 'dash'} display
 */
function formatMetricValue(value, display) {
    if (display === 'dash') {
        return '—';
    }
    if (display === 'percent') {
        return `${Number(value ?? 0).toFixed(1)}%`;
    }

    return formatCurrency(value ?? 0);
}

/**
 * @param {{ summary?: RevenueSummary, filters?: RevenueSummaryFilters }} props
 */
export function RevenueSummaryTable({ summary, filters }) {
    const s = { ...defaultSummary, ...summary };
    const periodLabel = summaryPeriodLabel(filters);

    const metrics = [
        {
            id: 'total_revenue',
            label: 'Water revenue',
            unpaid: s.total_revenue_unpaid,
            paid: s.total_revenue_paid,
            unpaidClass: 'text-amber-700',
            paidClass: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            id: 'fixed_charge_revenue',
            label: 'Fixed charges',
            unpaid: s.fixed_charge_unpaid,
            paid: s.fixed_charge_paid,
            unpaidClass: 'text-amber-700',
            paidClass: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            id: 'service_charges',
            label: 'Service charges',
            unpaid: s.service_charges_unpaid,
            paid: s.service_charges_paid,
            unpaidClass: 'text-amber-700',
            paidClass: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            id: 'total_billed_revenue',
            label: 'Total revenue',
            unpaid: s.total_outstanding,
            paid: s.total_paid,
            unpaidClass: 'text-amber-700',
            paidClass: 'text-foreground',
            rowClassName: 'border-t-2 border-border bg-muted/25',
        },
        {
            id: 'collection_rate',
            label: 'Collection rate',
            unpaidDisplay: 'dash',
            paid: s.collection_rate_percent ?? 0,
            paidDisplay: 'percent',
            paidClass: 'text-sky-900',
        },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Revenue breakdown</CardTitle>
                {periodLabel ? (
                    <p className="text-sm text-muted-foreground">{periodLabel}</p>
                ) : null}
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0">
                    <div className="overflow-x-auto rounded-lg border border-border/60">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-transparent">
                                    <TableHead className="px-4 py-3">Metric</TableHead>
                                    <TableHead className="px-4 py-3 text-right">Unpaid</TableHead>
                                    <TableHead className="px-4 py-3 text-right">Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics.map((row) => (
                                    <TableRow key={row.id} className={row.rowClassName}>
                                        <TableCell className="px-4 py-3 align-middle text-sm font-medium text-foreground">
                                            {row.label}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'px-4 py-3 text-right align-middle font-mono text-sm font-medium tabular-nums',
                                                row.unpaidClass,
                                            )}
                                        >
                                            {formatMetricValue(
                                                row.unpaid,
                                                row.unpaidDisplay ?? 'currency',
                                            )}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'px-4 py-3 text-right align-middle font-mono text-sm font-medium tabular-nums',
                                                row.paidClass,
                                            )}
                                        >
                                            {formatMetricValue(row.paid, row.paidDisplay ?? 'currency')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
            </CardContent>
        </Card>
    );
}
