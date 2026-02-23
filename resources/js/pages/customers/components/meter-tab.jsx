import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
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
import { Link, router } from '@inertiajs/react';
import { Calendar, Gauge, RefreshCw } from 'lucide-react';

export default function MeterTab({ customer }) {
    const lastReading =
        customer?.meter?.latest_reading?.current_reading ??
        customer?.meter?.readings?.[0]?.current_reading;
    const lastReadingDate =
        customer?.meter?.latest_reading?.reading_date ??
        customer?.meter?.readings?.[0]?.reading_date;

    return (
        <>
            <div className="mb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Gauge className="h-4 w-4" />
                    Meter & Connection
                </h2>
            </div>

            {customer.meter ? (
                <div className="mb-6 space-y-6">
                    {/* Main meter card */}
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <Gauge className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Meter number
                                    </p>
                                    <p className="font-mono text-lg font-bold tabular-nums">
                                        {customer.meter.meter_number}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-950/50">
                                    <Gauge className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Last reading
                                    </p>
                                    <p className="text-xl font-bold tabular-nums">
                                        {lastReading ?? '—'}{' '}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            m³
                                        </span>
                                    </p>
                                    {lastReadingDate && (
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(
                                                lastReadingDate,
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <span className="text-lg font-bold text-slate-600 capitalize dark:text-slate-400">
                                        {customer.meter.status?.[0] ?? '?'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Status
                                    </p>
                                    <Select
                                        value={
                                            customer.meter.status ?? 'active'
                                        }
                                        onValueChange={(value) => {
                                            router.put(
                                                route(
                                                    'meters.update',
                                                    customer.meter.id,
                                                ),
                                                { status: value },
                                                { preserveScroll: true },
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-[140px] border-0 bg-transparent p-0 shadow-none focus-visible:ring-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Maintenance
                                            </SelectItem>
                                            <SelectItem value="damage">
                                                Damaged
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-end sm:col-span-2 lg:col-span-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link
                                        href={route(
                                            'meters.assign',
                                            customer.id,
                                        )}
                                    >
                                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                        Replace meter
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="border-t bg-muted/30 px-6 py-3">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Installed:</span>{' '}
                                {customer.meter_install_date
                                    ? new Date(
                                          customer.meter_install_date,
                                      ).toLocaleDateString()
                                    : '—'}
                                {customer.meter.meter_type && (
                                    <>
                                        {' · '}
                                        <span className="capitalize">
                                            {customer.meter.meter_type}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Gauge className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="mb-1 text-sm font-medium">
                        No meter assigned
                    </p>
                    <p className="mb-4 max-w-xs text-xs text-muted-foreground">
                        Assign a meter to this customer to track consumption and
                        billing.
                    </p>
                    <Button variant="default" size="sm" asChild>
                        <Link href={route('meters.assign', customer.id)}>
                            <Gauge className="mr-2 h-3.5 w-3.5" />
                            Assign meter
                        </Link>
                    </Button>
                </div>
            )}

            {/* Meter history */}
            <div>
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                    Meter history
                </h3>
                {(customer.meter_history?.length ?? 0) > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Meter</TableHead>
                                    <TableHead>Unassigned</TableHead>
                                    <TableHead>Final reading</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customer.meter_history.map((h) => (
                                    <TableRow
                                        key={h.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell className="font-mono text-sm">
                                            {h.meter?.meter_number ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {h.unassigned_at
                                                ? new Date(
                                                      h.unassigned_at,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {h.final_reading ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground capitalize">
                                            {h.reason ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {h.replaced_by?.name ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                        No meter history
                    </p>
                )}
            </div>
        </>
    );
}
