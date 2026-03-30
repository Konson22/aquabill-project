import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    Building2,
    Calendar,
    Droplets,
    Gauge,
    Hash,
    MapPin,
    Phone,
    Receipt,
} from 'lucide-react';

function DetailField({ icon: Icon, label, children, className = '' }) {
    return (
        <div
            className={`rounded-xl border border-border/60 bg-muted/25 p-4 transition-colors hover:bg-muted/40 ${className}`}
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/50">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                {children}
            </p>
        </div>
    );
}

export default function OverviewTab({ accountSummary, customer }) {
    const lastReading =
        customer?.meter?.latest_reading?.current_reading ??
        customer?.meter?.readings?.[0]?.current_reading;
    const lastReadingDate =
        customer?.meter?.latest_reading?.reading_date ??
        customer?.meter?.readings?.[0]?.reading_date;
    const meterNo =
        customer?.meter?.meter_number ??
        customer?.meters?.[0]?.meter_number ??
        '—';

    const phoneEmail =
        [customer.phone, customer.email].filter(Boolean).join(' · ') || '—';
    const plotZoneArea =
        [
            customer.plot_number,
            customer.zone?.name,
            customer.area?.name,
        ]
            .filter(Boolean)
            .join(' · ') || '—';
    const joinedDate = new Date(customer.created_at).toLocaleDateString(
        undefined,
        {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        },
    );

    const stats = [
        {
            key: 'invoices',
            label: 'Unpaid invoices',
            caption: `${accountSummary.unpaidInvoices} unpaid · ${accountSummary.invoiceCount} total`,
            value: `${accountSummary.unpaidInvoices}/${accountSummary.invoiceCount}`,
            icon: Receipt,
        },
        {
            key: 'bills',
            label: 'Overdue bills',
            caption: `${accountSummary.overdueBills} overdue · ${accountSummary.billCount} bills`,
            value: `${accountSummary.overdueBills}/${accountSummary.billCount}`,
            icon: AlertCircle,
        },
        {
            key: 'meters',
            label: 'Connections',
            caption: 'Metered connections',
            value: String(accountSummary.totalMeters),
            icon: Droplets,
        },
        {
            key: 'reading',
            label: 'Last reading',
            caption: lastReadingDate
                ? new Date(lastReadingDate).toLocaleDateString()
                : 'No date on file',
            value: lastReading != null ? String(lastReading) : '—',
            suffix: lastReading != null ? 'm³' : null,
            icon: Gauge,
        },
        {
            key: 'meterNo',
            label: 'Meter no.',
            caption: 'Primary meter',
            value: meterNo,
            mono: true,
            icon: Hash,
        },
    ];

    return (
        <div className="mx-auto max-w-6xl space-y-10 p-6 lg:p-8">
            <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm ring-1 ring-border/30">
                <CardHeader className="space-y-1 border-b border-border/50 bg-muted/20 px-6 py-5">
                    <CardTitle className="text-lg font-semibold tracking-tight">
                        Customer details
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Contact and location on file
                    </p>
                </CardHeader>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                    <DetailField icon={Phone} label="Phone & email">
                        {phoneEmail}
                    </DetailField>
                    <DetailField icon={Building2} label="Plot, zone & area">
                        {plotZoneArea}
                    </DetailField>
                    <DetailField
                        icon={MapPin}
                        label="Address"
                        className="sm:col-span-2"
                    >
                        {customer.address || '—'}
                    </DetailField>
                    <DetailField icon={Calendar} label="Customer since">
                        {joinedDate}
                    </DetailField>
                </CardContent>
            </Card>

            <div>
                <div className="mb-5">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Account snapshot
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Invoices, bills, connections, and meter readings
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {stats.map(
                        ({
                            key,
                            label,
                            caption,
                            value,
                            suffix,
                            mono,
                            icon: Icon,
                        }) => (
                            <Card
                                key={key}
                                className="group overflow-hidden rounded-xl border-border/60 bg-card shadow-sm ring-1 ring-border/20 transition-all hover:border-border hover:shadow-md hover:ring-border/40"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                            <Icon
                                                className="h-[18px] w-[18px]"
                                                strokeWidth={1.75}
                                            />
                                        </span>
                                    </div>
                                    <p
                                        className={`mt-4 text-[1.75rem] font-semibold tabular-nums leading-none tracking-tight text-foreground ${mono ? 'font-mono text-xl' : ''}`}
                                    >
                                        {value}
                                        {suffix ? (
                                            <span className="ml-1 text-lg font-normal text-muted-foreground">
                                                {suffix}
                                            </span>
                                        ) : null}
                                    </p>
                                    <p className="mt-3 text-xs font-medium text-foreground/80">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                                        {caption}
                                    </p>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>
            </div>
        </div>
    );
}
