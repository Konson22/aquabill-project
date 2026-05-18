import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

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
 * @param {string} paymentFrom
 * @param {string} paymentTo
 */
function stationFilterPeriodLabel(paymentFrom, paymentTo) {
    const fromLabel = formatFilterDate(paymentFrom);
    const toLabel = formatFilterDate(paymentTo);

    if (fromLabel && toLabel) {
        return `Collection filters above use ${fromLabel} – ${toLabel}`;
    }
    if (fromLabel) {
        return `Collection filters above use from ${fromLabel}`;
    }
    if (toLabel) {
        return `Collection filters above use through ${toLabel}`;
    }

    return 'Use the collection filters above to scope payment-period figures by station.';
}

/**
 * @param {{
 *   stations?: { id: number, name: string }[],
 *   selectedStationId?: string,
 *   paymentFrom?: string,
 *   paymentTo?: string,
 * }} props
 */
export default function StationsList({ stations = [], selectedStationId = 'all', paymentFrom = '', paymentTo = '' }) {
    const list = Array.isArray(stations) ? stations : [];
    const periodLabel = stationFilterPeriodLabel(paymentFrom, paymentTo);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-4 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Collection stations
                    </CardTitle>
                    <p className="text-sm font-medium leading-snug text-foreground">{periodLabel}</p>
                    <p className="text-sm text-muted-foreground">
                        Active desks used for payments. The highlighted row matches the station filter when one is
                        selected.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0">
                {list.length === 0 ? (
                    <p className="px-4 pb-4 text-sm text-muted-foreground sm:px-0">
                        No stations configured yet. Add them under Admin → Stations.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border/60">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-transparent">
                                    <TableHead className="px-4 py-3">Station</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {list.map((station) => {
                                    const isSelected =
                                        selectedStationId !== 'all' && String(station.id) === String(selectedStationId);

                                    return (
                                        <TableRow
                                            key={station.id}
                                            className={cn(isSelected && 'bg-primary/5')}
                                        >
                                            <TableCell className="px-4 py-3 align-middle text-sm font-medium text-foreground">
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <Building2
                                                        className={cn(
                                                            'h-4 w-4 shrink-0',
                                                            isSelected ? 'text-primary' : 'text-muted-foreground',
                                                        )}
                                                        aria-hidden
                                                    />
                                                    <span className="truncate">{station.name}</span>
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
