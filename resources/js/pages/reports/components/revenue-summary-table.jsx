import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn, formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';

/** @typedef {{ total_revenue: number, fixed_charge_revenue: number, total_billed_revenue: number, total_paid: number, total_outstanding: number, collection_rate_percent: number }} RevenueSummary */

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

/**
 * @param {number} year
 * @param {number} monthIndex 0–11
 * @returns {{ from: string, to: string }}
 */
function monthDateRangeForYear(year, monthIndex) {
    const m = String(monthIndex + 1).padStart(2, '0');
    const from = `${year}-${m}-01`;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const to = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

    return { from, to };
}

/**
 * @param {number} year
 * @returns {{ from: string, to: string }}
 */
function fullCalendarYearRange(year) {
    return { from: `${year}-01-01`, to: `${year}-12-31` };
}

/**
 * @param {RevenueSummaryFilters | undefined} filters
 * @param {number} year
 * @returns {'year' | 'custom' | `${number}`}
 */
function detectBillDatePreset(filters, year) {
    const from = filters?.from?.trim() ?? '';
    const to = filters?.to?.trim() ?? '';

    if (!from || !to) {
        return 'year';
    }

    const fullYear = fullCalendarYearRange(year);
    if (from === fullYear.from && to === fullYear.to) {
        return 'year';
    }

    for (let i = 0; i < 12; i++) {
        const r = monthDateRangeForYear(year, i);
        if (from === r.from && to === r.to) {
            return String(i);
        }
    }

    return 'custom';
}

/**
 * @param {number} year
 */
function monthLabelsForYear(year) {
    return Array.from({ length: 12 }, (_, i) =>
        new Date(year, i, 1).toLocaleDateString('en-GB', { month: 'long' }),
    );
}

/** Mirrors backend: sum of Bill.current_charge (water / usage charges only; not fixed fees or arrears). */
const defaultSummary = {
    total_revenue: 0,
    fixed_charge_revenue: 0,
    total_billed_revenue: 0,
    total_paid: 0,
    total_outstanding: 0,
    collection_rate_percent: 0,
};

/**
 * @param {string} value
 */
function csvCell(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * @param {RevenueSummary} summary
 * @param {RevenueSummaryFilters | undefined} filters
 */
function exportSummaryCsv(summary, filters) {
    const lines = [
        ['Period', summaryPeriodLabel(filters)],
        ['Metric', 'Amount (SSP)'],
        ['Water revenue', summary.total_revenue],
        ['Fixed charges', summary.fixed_charge_revenue],
        ['Total revenue', summary.total_billed_revenue],
        ['Collected', summary.total_paid],
        ['Collection rate (%)', summary.collection_rate_percent],
        ['Outstanding', summary.total_outstanding],
    ];
    const csv = lines.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const parts = [];
    if (filters?.from) {
        parts.push(filters.from);
    }
    if (filters?.to) {
        parts.push(filters.to);
    }
    const range = parts.length ? `_${parts.join('_')}` : '';
    a.href = url;
    a.download = `revenue-period-summary${range}.csv`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/**
 * @param {{ summary?: RevenueSummary, filters?: RevenueSummaryFilters, onBillDateRangeChange?: (from: string, to: string) => void, billDateFilterYear?: number }} props
 */
export function RevenueSummaryTable({ summary, filters, onBillDateRangeChange, billDateFilterYear }) {
    const s = { ...defaultSummary, ...summary };
    const periodLabel = summaryPeriodLabel(filters);
    const year = typeof billDateFilterYear === 'number' ? billDateFilterYear : new Date().getFullYear();
    const monthPreset = detectBillDatePreset(filters, year);
    const monthLabels = monthLabelsForYear(year);

    const metrics = [
        {
            id: 'total_revenue',
            label: 'Water revenue',
            value: s.total_revenue,
            valueType: 'currency',
            amountClass: 'text-emerald-700',
        },
        {
            id: 'fixed_charge_revenue',
            label: 'Fixed charges',
            value: s.fixed_charge_revenue,
            valueType: 'currency',
            amountClass: 'text-violet-700',
        },
        {
            id: 'total_billed_revenue',
            label: 'Total revenue',
            value: s.total_billed_revenue,
            valueType: 'currency',
            amountClass: 'text-foreground',
            rowClassName: 'border-t-2 border-border bg-muted/25',
        },
        {
            id: 'total_paid',
            label: 'Collected',
            value: s.total_paid,
            valueType: 'currency',
            amountClass: 'text-foreground',
        },
        {
            id: 'collection_rate',
            label: 'Collection rate',
            value: s.collection_rate_percent ?? 0,
            valueType: 'percent',
            amountClass: 'text-sky-900',
        },
        {
            id: 'total_outstanding',
            label: 'Outstanding',
            value: s.total_outstanding,
            valueType: 'currency',
            amountClass: 'text-amber-700',
        },
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                    <CardTitle className="text-base">Period summary</CardTitle>
                    <p className="text-sm font-medium leading-snug text-foreground">{periodLabel}</p>
                    <p className="text-sm text-muted-foreground">
                        Billings issued in this range (by bill date) and cash position.
                    </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <Select
                        value={monthPreset}
                        onValueChange={(value) => {
                            if (!onBillDateRangeChange || value === 'custom') {
                                return;
                            }
                            if (value === 'year') {
                                const r = fullCalendarYearRange(year);
                                onBillDateRangeChange(r.from, r.to);

                                return;
                            }
                            const idx = Number.parseInt(value, 10);
                            if (!Number.isNaN(idx) && idx >= 0 && idx < 12) {
                                const r = monthDateRangeForYear(year, idx);
                                onBillDateRangeChange(r.from, r.to);
                            }
                        }}
                        disabled={!onBillDateRangeChange}
                    >
                        <SelectTrigger
                            id="revenue-summary-bill-month"
                            aria-label="Bill date range"
                            className="h-9 w-full min-w-[12rem] sm:w-[15rem]"
                        >
                            <SelectValue placeholder="Bill period" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectGroup>
                                <SelectLabel className="text-[10px] uppercase tracking-widest">Bill period ({year})</SelectLabel>
                                <SelectItem value="year">Full year {year}</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel className="text-[10px] uppercase tracking-widest">By month</SelectLabel>
                                {monthLabels.map((label, i) => (
                                    <SelectItem key={i} value={String(i)}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                            {monthPreset === 'custom' ? (
                                <>
                                    <SelectSeparator />
                                    <SelectItem value="custom">Non-month range (clear in URL or pick a month)</SelectItem>
                                </>
                            ) : null}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0"
                        onClick={() => exportSummaryCsv(s, filters)}
                    >
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0">
                <div className="overflow-x-auto rounded-lg border border-border/60">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-transparent">
                                <TableHead className="px-4 py-3">Metric</TableHead>
                                <TableHead className="px-4 py-3 text-right">Value</TableHead>
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
                                            row.amountClass,
                                        )}
                                    >
                                        {row.valueType === 'percent'
                                            ? `${Number(row.value).toFixed(1)}%`
                                            : formatCurrency(row.value)}
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
