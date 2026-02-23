import {
    AlertCircle,
    Droplets,
    Gauge,
    LayoutDashboard,
    Receipt,
} from 'lucide-react';

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

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Account Overview</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50">
                        <Receipt className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Unpaid Invoices
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                            {accountSummary.unpaidInvoices}/
                            {accountSummary.invoiceCount}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50">
                        <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Overdue Bills
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                            {accountSummary.overdueBills}/
                            {accountSummary.billCount}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5 sm:col-span-2 lg:col-span-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Droplets className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Connections
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                            {accountSummary.totalMeters}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-950/50">
                        <Gauge className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Last Reading
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                            {lastReading ?? '—'}{' '}
                            <span className="text-base font-normal text-muted-foreground">
                                m³
                            </span>
                        </p>
                        {lastReadingDate && (
                            <p className="text-xs text-muted-foreground">
                                {new Date(lastReadingDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <Gauge className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Meter No
                        </p>
                        <p className="font-mono text-xl font-bold tabular-nums">
                            {meterNo}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
