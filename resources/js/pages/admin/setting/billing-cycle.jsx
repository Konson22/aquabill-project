import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';

const breadcrumbs = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Settings', href: route('admin.settings') },
    { title: 'Billing cycle', href: route('admin.billing-cycle.edit') },
];

const CYCLE_OPTIONS = [
    { value: 'monthly', label: 'Monthly', hint: 'One billing period per calendar month' },
    { value: 'bimonthly', label: 'Bimonthly', hint: 'Every two months (stored for reporting; periods still close monthly)' },
    { value: 'quarterly', label: 'Quarterly', hint: 'Every three months (stored for reporting; periods still close monthly)' },
];

function formatShortDate(isoDate) {
    if (!isoDate) {
        return '—';
    }

    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * @param {{ settings: { billing_cycle: string, billing_cycle_day: number, current_billing_period_start: string, current_billing_period_end: string } }} props
 */
export default function BillingCycle({ settings }) {
    const { data, setData, put, processing, errors } = useForm({
        billing_cycle: settings.billing_cycle ?? 'monthly',
        billing_cycle_day: String(settings.billing_cycle_day ?? 27),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.billing-cycle.update'), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing cycle" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                    <Link href={route('admin.settings')}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to settings
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Billing cycle</h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Set how often you bill and which day of the month each period closes. Meter readings and
                        dashboards use the current period below.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <RevenueStatCard title="Period start" valueClassName="text-foreground">
                        {formatShortDate(settings.current_billing_period_start)}
                    </RevenueStatCard>
                    <RevenueStatCard title="Period end (close day)" valueClassName="text-violet-600 dark:text-violet-400">
                        {formatShortDate(settings.current_billing_period_end)}
                    </RevenueStatCard>
                </div>

                <Card className="max-w-xl border-border/60 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="h-5 w-5 text-violet-600" />
                            Cycle configuration
                        </CardTitle>
                        <CardDescription>
                            The close day is the last day of each billing period (1–28). Periods run from the day
                            after the previous close through this day.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="billing_cycle">Billing frequency</Label>
                                <Select
                                    value={data.billing_cycle}
                                    onValueChange={(value) => setData('billing_cycle', value)}
                                >
                                    <SelectTrigger id="billing_cycle">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CYCLE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {CYCLE_OPTIONS.find((o) => o.value === data.billing_cycle)?.hint}
                                </p>
                                <InputError message={errors.billing_cycle} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="billing_cycle_day">Period close day of month</Label>
                                <Input
                                    id="billing_cycle_day"
                                    type="number"
                                    min={1}
                                    max={28}
                                    value={data.billing_cycle_day}
                                    onChange={(e) => setData('billing_cycle_day', e.target.value)}
                                    className="max-w-[8rem] tabular-nums"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Example: day 27 means each period ends on the 27th; the next period starts on the
                                    28th.
                                </p>
                                <InputError message={errors.billing_cycle_day} />
                            </div>

                            <Button type="submit" disabled={processing} className="w-fit gap-2">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Save billing cycle
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
