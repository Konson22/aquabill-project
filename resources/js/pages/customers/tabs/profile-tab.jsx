import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import DisconnectionManagement from '@/pages/connection-management/components/disconnection-management';
import {
    Calendar,
    Droplets,
    Gauge,
    Hash,
    Mail,
    MapPin,
    Phone,
    Receipt,
    Tag,
    TriangleAlert,
    User,
} from 'lucide-react';

function ProfileStat({ label, value, subValue, icon: Icon, tone = 'sky' }) {
    const tones = {
        sky: {
            card: 'border-sky-100 bg-sky-50/80',
            icon: 'bg-sky-100 text-sky-700',
            value: 'text-sky-950',
        },
        blue: {
            card: 'border-blue-100 bg-blue-50/80',
            icon: 'bg-blue-100 text-blue-700',
            value: 'text-blue-950',
        },
        slate: {
            card: 'border-slate-200 bg-slate-50/80',
            icon: 'bg-slate-100 text-slate-700',
            value: 'text-slate-950',
        },
        amber: {
            card: 'border-amber-100 bg-amber-50/80',
            icon: 'bg-amber-100 text-amber-700',
            value: 'text-amber-950',
        },
    };

    const styles = tones[tone] ?? tones.sky;

    return (
        <div className={cn('rounded-xl border p-4 shadow-sm', styles.card)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className={cn('mt-1 truncate font-mono text-lg font-bold tabular-nums', styles.value)}>{value}</p>
                    {subValue ? <p className="mt-0.5 text-xs text-muted-foreground">{subValue}</p> : null}
                </div>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', styles.icon)}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, children }) {
    return (
        <div className="flex gap-3 border-b border-border/60 py-3.5 last:border-0 last:pb-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <div className="mt-1 text-sm font-medium leading-relaxed text-foreground">{children}</div>
            </div>
        </div>
    );
}

export default function ProfileTab({
    customer,
    statusVariant,
    currentMeter,
    lastReadingValue,
    totalBills,
    unpaidBillCount,
    formatDate,
}) {
    const hasUnpaid = unpaidBillCount > 0;
    const tariff = customer?.tariff;
    const zone = customer?.zone;

    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProfileStat
                    label="Current meter"
                    value={currentMeter?.meter_number ?? '—'}
                    subValue={currentMeter?.status ? `Status: ${currentMeter.status}` : null}
                    icon={Gauge}
                    tone="sky"
                />
                <ProfileStat
                    label="Last reading"
                    value={lastReadingValue}
                    subValue={
                        currentMeter?.latest_reading?.reading_date || currentMeter?.latestReading?.reading_date
                            ? formatDate(
                                  currentMeter.latest_reading?.reading_date ?? currentMeter.latestReading?.reading_date,
                              )
                            : null
                    }
                    icon={Droplets}
                    tone="blue"
                />
                <ProfileStat
                    label="Total bills"
                    value={totalBills.toLocaleString()}
                    icon={Receipt}
                    tone="slate"
                />
                <ProfileStat
                    label="Unpaid bills"
                    value={unpaidBillCount.toLocaleString()}
                    subValue={hasUnpaid ? 'Requires follow-up' : 'All clear'}
                    icon={TriangleAlert}
                    tone={hasUnpaid ? 'amber' : 'slate'}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="border shadow-sm lg:col-span-3">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground">Profile details</CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground">Contact, location, and account identifiers</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant={statusVariant} className="h-6 capitalize">
                                    {customer?.status ?? 'unknown'}
                                </Badge>
                                <Badge variant="outline" className="h-6 uppercase">
                                    {customer?.customer_type ?? '—'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <DetailItem icon={Phone} label="Phone">
                            {customer?.phone ?? '—'}
                        </DetailItem>
                        <DetailItem icon={Mail} label="Email">
                            {customer?.email ?? <span className="font-normal text-muted-foreground">No email on file</span>}
                        </DetailItem>
                        <DetailItem icon={MapPin} label="Address">
                            <p>{customer?.address ?? '—'}</p>
                            {(customer?.plot_no || customer?.national_id) && (
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                    {customer?.plot_no ? (
                                        <span className="rounded-md bg-muted/50 px-2 py-1">
                                            Plot <span className="font-mono font-semibold text-foreground">{customer.plot_no}</span>
                                        </span>
                                    ) : null}
                                    {customer?.national_id ? (
                                        <span className="rounded-md bg-muted/50 px-2 py-1">
                                            ID <span className="font-mono font-semibold text-foreground">{customer.national_id}</span>
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </DetailItem>
                        {customer?.latitude != null && customer?.longitude != null ? (
                            <DetailItem icon={MapPin} label="Coordinates">
                                <span className="font-mono text-xs tabular-nums">
                                    {Number(customer.latitude).toFixed(6)}, {Number(customer.longitude).toFixed(6)}
                                </span>
                            </DetailItem>
                        ) : null}
                    </CardContent>
                </Card>

                <div className="space-y-6 lg:col-span-2">
                    <Card className="border shadow-sm">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-base font-bold text-foreground">Billing & service</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Zone</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{zone?.name ?? '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <Tag className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tariff</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{tariff?.name ?? '—'}</p>
                                    {tariff?.price_per_unit != null ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {Number(tariff.price_per_unit).toLocaleString()} / unit
                                            {tariff?.fixed_charge != null
                                                ? ` · fixed ${Number(tariff.fixed_charge).toLocaleString()}`
                                                : ''}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="space-y-2 border-t pt-4">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Connection date
                                    </span>
                                    <span className="font-medium text-foreground">{formatDate(customer?.connection_date)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        Record created
                                    </span>
                                    <span className="font-medium text-foreground">{formatDate(customer?.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Hash className="h-3.5 w-3.5" />
                                        Customer ID
                                    </span>
                                    <span className="font-mono font-medium tabular-nums text-foreground">{customer?.id ?? '—'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <DisconnectionManagement customer={customer} />
                </div>
            </div>
        </div>
    );
}
