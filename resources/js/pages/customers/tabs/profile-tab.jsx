import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Calendar, MapPin, Phone, User } from 'lucide-react';
import DisconnectionManagement from '../components/disconnection-management';

export default function ProfileTab({
    customer,
    statusVariant,
    currentMeter,
    lastReadingValue,
    totalBills,
    unpaidBillCount,
    formatDate,
}) {
    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border shadow-sm">
                <CardContent className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="space-y-1.5">
                                    <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground">{customer?.name ?? 'Customer'}</h1>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono text-sm font-bold text-primary">{customer?.account_number ?? '—'}</span>
                                        <Badge variant={statusVariant} className="h-5 capitalize text-[10px]">
                                            <BadgeCheck className="mr-1 h-3 w-3" />
                                            {customer?.status ?? 'unknown'}
                                        </Badge>
                                        <Badge variant="outline" className="h-5 text-[10px] uppercase">
                                            {customer?.customer_type ?? '—'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Meter</p>
                        <p className="mt-1 font-mono text-sm font-semibold text-foreground">{currentMeter?.meter_number ?? '—'}</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Reading</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{lastReadingValue}</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Bills</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{totalBills}</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unpaid Bill</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{unpaidBillCount}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Customer Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                    <section className="space-y-2">
                        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            Contact
                        </h3>
                        <p className="text-sm font-medium text-foreground">{customer?.phone ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email ?? 'No email address'}</p>
                    </section>
                    <section className="space-y-2 border-t pt-4">
                        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            Address
                        </h3>
                        <p className="text-sm leading-relaxed text-foreground">{customer?.address ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">Plot: {customer?.plot_no ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">National ID: {customer?.national_id ?? '—'}</p>
                    </section>
                    <section className="space-y-2 border-t pt-4">
                        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Timeline
                        </h3>
                        <p className="text-xs text-muted-foreground">Connection Date: <span className="font-medium text-foreground">{formatDate(customer?.connection_date)}</span></p>
                        <p className="text-xs text-muted-foreground">Created Date: <span className="font-medium text-foreground">{formatDate(customer?.created_at)}</span></p>
                    </section>
                </CardContent>
            </Card>

            <DisconnectionManagement customer={customer} />
        </div>
    );
}
