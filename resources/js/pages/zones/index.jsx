import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, Droplets, Edit2, History, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateZoneModal from './components/create-zone-modal';

function formatScheduleTime(time) {
    if (!time) {
        return null;
    }

    return String(time).slice(0, 5);
}

function formatSupplyDate(isoDate) {
    if (!isoDate) {
        return '—';
    }

    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatSupplySchedules(schedules) {
    if (!schedules?.length) {
        return [];
    }

    return schedules.map((schedule) => {
        const day = schedule.supply_day?.name ?? 'Day';
        const time = formatScheduleTime(schedule.start_time);
        const reserve = schedule.supply_day?.is_reserve ? ' (reserve)' : '';
        const line = time ? `${day} · ${time}` : day;

        return `${line}${reserve}`;
    });
}

const SUPPLY_KIND_STYLES = {
    scheduled: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    reserve: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
    makeup: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
};

/**
 * @param {string} kind
 */
function SupplyKindBadge({ kind }) {
    const label = kind === 'makeup' ? 'Make-up' : kind.charAt(0).toUpperCase() + kind.slice(1);

    return (
        <Badge variant="outline" className={cn('border-0 text-[10px] font-semibold uppercase', SUPPLY_KIND_STYLES[kind] ?? '')}>
            {label}
        </Badge>
    );
}

function openStreetMapUrlFromBoundary(boundary) {
    if (!boundary || boundary.type !== 'Polygon' || !boundary.coordinates?.[0]?.length) {
        return null;
    }
    const ring = boundary.coordinates[0];
    let sumLat = 0;
    let sumLng = 0;
    let n = 0;
    for (const p of ring) {
        const [lng, lat] = p;
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            continue;
        }
        sumLat += lat;
        sumLng += lng;
        n += 1;
    }
    if (!n) {
        return null;
    }
    const clat = sumLat / n;
    const clng = sumLng / n;
    return `https://www.openstreetmap.org/#map=14/${clat}/${clng}`;
}

const breadcrumbs = [
    {
        title: 'Zones',
        href: route('zones.index'),
    },
];

/**
 * @param {{
 *   zones: Array<Record<string, unknown>>,
 *   waterSupplySchedules?: Array<Record<string, unknown>>,
 *   supplyHistories?: Array<Record<string, unknown>>,
 *   reserveDays?: Array<{ id: number, name: string }>,
 * }} props
 */
export default function Zones({
    zones,
    waterSupplySchedules = [],
    supplyHistories = [],
    reserveDays = [],
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Zones" />

            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <MapPin className="h-6 w-6 text-red-500" />
                            Billing Zones
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage geographic billing areas, water supply schedules, and customer density.
                        </p>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Zone
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <TableHead className="px-4 py-3">Zone</TableHead>
                                <TableHead className="px-4 py-3 text-right">Customers</TableHead>
                                <TableHead className="px-4 py-3">Supply schedule</TableHead>
                                <TableHead className="px-4 py-3">Map</TableHead>
                                <TableHead className="px-4 py-3">Status</TableHead>
                                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.length > 0 ? (
                                zones.map((zone) => (
                                    <TableRow key={zone.id} className="hover:bg-muted/30">
                                        <TableCell className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-foreground">{zone.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right tabular-nums font-medium text-foreground">
                                            <div>{zone.customers_count}</div>
                                            {zone.supply_histories_count > 0 ? (
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    {zone.supply_histories_count} supply log
                                                    {zone.supply_histories_count === 1 ? '' : 's'}
                                                </div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            {formatSupplySchedules(zone.supply_schedules).length > 0 ? (
                                                <ul className="space-y-1 text-sm text-muted-foreground">
                                                    {formatSupplySchedules(zone.supply_schedules).map((line) => (
                                                        <li key={`${zone.id}-${line}`} className="flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 shrink-0" />
                                                            <Clock className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                                            {line}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Not set</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            {(() => {
                                                const href = openStreetMapUrlFromBoundary(zone.boundary_geojson);
                                                return href ? (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        Open map
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Not set</span>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell className="px-4 py-4">
                                            <Badge variant={zone.status === 'active' ? 'success' : 'secondary'}>
                                                {zone.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                                <Edit2 className="h-3 w-3" />
                                                Configure
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                                    >
                                        No billing zones yet. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <section className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                                <Droplets className="h-5 w-5 text-cyan-600" />
                                Water supply
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Active weekly plans and logged supply runs. On reserve days (
                                {reserveDays.length > 0
                                    ? reserveDays.map((d) => d.name).join(', ')
                                    : 'none configured'}
                                ) any zone may be resupplied.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b bg-muted/30 px-4 py-3">
                            <h3 className="text-sm font-semibold text-foreground">Active supply plan</h3>
                            <p className="text-xs text-muted-foreground">Current weekday windows per zone</p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/40">
                                    <TableHead className="px-4 py-3">Zone</TableHead>
                                    <TableHead className="px-4 py-3">Supply day</TableHead>
                                    <TableHead className="px-4 py-3">Time</TableHead>
                                    <TableHead className="px-4 py-3">Effective from</TableHead>
                                    <TableHead className="px-4 py-3">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {waterSupplySchedules.length > 0 ? (
                                    waterSupplySchedules.map((row) => (
                                        <TableRow key={row.id} className="text-sm hover:bg-muted/30">
                                            <TableCell className="px-4 py-3 font-medium">{row.zone?.name ?? '—'}</TableCell>
                                            <TableCell className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                    {row.supply_day?.name ?? '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 tabular-nums text-muted-foreground">
                                                {formatScheduleTime(row.start_time) ?? '—'}
                                                {row.end_time
                                                    ? ` – ${formatScheduleTime(row.end_time)}`
                                                    : ''}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-muted-foreground">
                                                {formatSupplyDate(row.effective_from)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                {row.supply_day?.is_reserve ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-200 bg-amber-50 text-[10px] text-amber-900"
                                                    >
                                                        Reserve day
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Regular</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="px-4 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            No active supply plans. Assign weekdays and times per zone.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="border-b bg-muted/30 px-4 py-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <History className="h-4 w-4 text-muted-foreground" />
                                Supply history
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Latest recorded supply runs (scheduled, reserve, and make-up)
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted/40">
                                        <TableHead className="px-4 py-3">Date</TableHead>
                                        <TableHead className="px-4 py-3">Zone</TableHead>
                                        <TableHead className="px-4 py-3">Day</TableHead>
                                        <TableHead className="px-4 py-3">Time</TableHead>
                                        <TableHead className="px-4 py-3">Kind</TableHead>
                                        <TableHead className="px-4 py-3">Notes</TableHead>
                                        <TableHead className="px-4 py-3">Recorded by</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supplyHistories.length > 0 ? (
                                        supplyHistories.map((entry) => (
                                            <TableRow key={entry.id} className="text-sm hover:bg-muted/30">
                                                <TableCell className="px-4 py-3 font-medium tabular-nums">
                                                    {formatSupplyDate(entry.supplied_on)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3">{entry.zone?.name ?? '—'}</TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {entry.supply_day?.name ?? '—'}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 tabular-nums text-muted-foreground">
                                                    {formatScheduleTime(entry.start_time) ?? '—'}
                                                    {entry.end_time
                                                        ? ` – ${formatScheduleTime(entry.end_time)}`
                                                        : ''}
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <SupplyKindBadge kind={entry.kind} />
                                                </TableCell>
                                                <TableCell className="max-w-[200px] px-4 py-3 text-muted-foreground">
                                                    <span className="line-clamp-2">{entry.notes || '—'}</span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground">
                                                    {entry.recorded_by?.name ?? '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                                            >
                                                <Droplets className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                                No supply history logged yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </section>
            </div>

            <CreateZoneModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </AppLayout>
    );
}
