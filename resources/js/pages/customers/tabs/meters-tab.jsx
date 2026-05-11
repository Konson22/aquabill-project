import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Gauge } from 'lucide-react';

export default function MetersTab({
    meters,
    meterHistories,
    formatDate,
    onOpenStatus,
    onOpenReplace,
}) {
    return (
        <>
            {!meters.length ? (
                <div className="rounded-lg border border-dashed bg-muted/5 p-8 text-center text-sm text-muted-foreground">
                    <Gauge className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p>No meter is assigned to this customer.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {meters.map((meter) => (
                        <div key={meter.id} className="rounded-lg border bg-card p-3 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="font-mono text-sm font-bold text-foreground">{meter?.meter_number ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Type: {meter?.meter_type ?? '—'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={meter?.status === 'active' ? 'success' : 'secondary'} className="w-fit capitalize text-[10px]">
                                        {meter?.status ?? 'unknown'}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => onOpenStatus(meter)}>
                                            Status
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10" onClick={() => onOpenReplace(meter)}>
                                            Replace
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                <p>Installed: <span className="font-medium text-foreground">{formatDate(meter?.installation_date)}</span></p>
                                <p>Last Reading: <span className="font-medium text-foreground">{meter?.last_reading?.reading_value ?? meter?.lastReading?.reading_value ?? '—'}</span></p>
                                <p>Last Read Date: <span className="font-medium text-foreground">{formatDate(meter?.last_reading?.reading_date ?? meter?.lastReading?.reading_date)}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meterHistories.length > 0 && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Meter Replacement History</h3>
                    </div>
                    <div className="space-y-3">
                        {meterHistories.map((history) => (
                            <div key={history.id} className="rounded-lg border bg-muted/20 p-4 text-sm shadow-sm">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="font-mono font-bold text-foreground">{history.meter?.meter_number ?? 'Unknown Meter'}</p>
                                        <p className="text-xs text-muted-foreground">Unassigned on: {formatDate(history.unassigned_at)}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-xs font-medium text-foreground">Reason: {history.reason}</p>
                                        <p className="text-[10px] text-muted-foreground">Final Reading: {history.final_reading}</p>
                                    </div>
                                </div>
                                {history.notes && <div className="mt-2 border-t pt-2 text-[11px] italic text-muted-foreground">Notes: {history.notes}</div>}
                                <div className="mt-2 text-[10px] text-muted-foreground">Processed by: {history.replaced_by?.name ?? history.replacedBy?.name ?? 'System'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
