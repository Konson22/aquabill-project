import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Ban,
    BellOff,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    PowerOff,
    Printer,
    RotateCcw,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DISCONNECTION_STEPS = [
    {
        key: 'active',
        title: 'Active service',
        description: 'No disconnection notice in effect.',
    },
    {
        key: 'notice',
        title: '30-day notice',
        description: 'Formal compliance notice period.',
    },
    {
        key: 'grace',
        title: '15-day grace',
        description: 'Final window before disconnection may proceed.',
    },
    {
        key: 'disconnected',
        title: 'Disconnected',
        description: 'Water service suspended.',
    },
    {
        key: 'reconnected',
        title: 'Reconnected',
        description: 'Service restored after compliance.',
    },
];

/**
 * @returns {number} Index into DISCONNECTION_STEPS (0–4).
 */
function resolveDisconnectionStepIndex(customer, activeNotice, disconnections) {
    if (customer.status === 'disconnected') {
        return 3;
    }
    if (activeNotice?.status === 'grace_period') {
        return 2;
    }
    if (activeNotice?.status === 'notified') {
        return 1;
    }
    const latest = disconnections[0] ?? null;
    if (customer.status === 'active' && latest?.status === 'reconnected') {
        return 4;
    }

    return 0;
}

export default function DisconnectionStatusContent({ customer }) {
    const disconnections = customer.disconnections || [];
    const activeNotice = disconnections.find((d) => d.status === 'notified' || d.status === 'grace_period');
    const currentStepIndex = resolveDisconnectionStepIndex(customer, activeNotice, disconnections);
    const currentStep = DISCONNECTION_STEPS[currentStepIndex];

    const { data, setData, post, processing, reset } = useForm({
        reason: '',
        notes: '',
        disconnection_type: 'water_blocked',
    });

    const cancelNoticeForm = useForm({
        notes: '',
    });

    const reconnectForm = useForm({
        notes: '',
    });

    const handleNotify = (e) => {
        e.preventDefault();
        post(route('customers.notify-disconnection', customer.id), {
            onSuccess: () => reset(),
        });
    };

    const handleDisconnect = (e) => {
        e.preventDefault();
        post(route('customers.disconnect', customer.id), {
            onSuccess: () => reset(),
        });
    };

    const handleReconnect = (e) => {
        e.preventDefault();
        reconnectForm.post(route('customers.reconnect', customer.id), {
            onSuccess: () => reconnectForm.reset(),
        });
    };

    const handleCancelNotice = (e) => {
        e.preventDefault();
        cancelNoticeForm.post(route('customers.cancel-disconnection-notice', customer.id), {
            onSuccess: () => cancelNoticeForm.reset(),
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return '—';
        }
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-8">
            <p className="text-sm text-muted-foreground">
                Manage notices and actual disconnections (30 days notice + 15 days grace).
            </p>

            <div className="rounded-xl border bg-muted/30 p-4 shadow-sm md:p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Where you are in the process</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                    Step {currentStepIndex + 1} of {DISCONNECTION_STEPS.length}: {currentStep.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{currentStep.description}</p>

                <ol
                    className="mt-6 grid grid-cols-1 gap-4 border-t border-border/60 pt-6 sm:grid-cols-5 sm:gap-2 sm:border-t-0 sm:pt-0"
                    aria-label="Disconnection workflow steps"
                >
                    {DISCONNECTION_STEPS.map((step, index) => {
                        const isComplete = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const isUpcoming = index > currentStepIndex;

                        return (
                            <li
                                key={step.key}
                                className="flex gap-3 sm:flex-col sm:items-center sm:text-center"
                                aria-current={isCurrent ? 'step' : undefined}
                            >
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black tabular-nums',
                                        isComplete && 'border-primary bg-primary text-primary-foreground',
                                        isCurrent && 'border-primary bg-background text-primary shadow-[0_0_0_3px] shadow-primary/25',
                                        isUpcoming && 'border-muted-foreground/25 bg-background text-muted-foreground',
                                    )}
                                >
                                    {isComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
                                </div>
                                <div className="min-w-0 flex-1 sm:mt-2 sm:px-0.5">
                                    <p
                                        className={cn(
                                            'text-xs font-bold leading-tight sm:text-[11px]',
                                            isCurrent && 'text-primary',
                                            isComplete && 'text-foreground',
                                            isUpcoming && 'text-muted-foreground',
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground sm:line-clamp-2">{step.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-6 hidden h-1.5 w-full overflow-hidden rounded-full bg-muted sm:block" aria-hidden>
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / DISCONNECTION_STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Current status</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={customer.status === 'active' ? 'success' : 'destructive'}
                                className="px-3 py-1 text-sm font-bold uppercase tracking-tight"
                            >
                                {customer.status}
                            </Badge>
                            {activeNotice && activeNotice.status === 'notified' && (
                                <Badge
                                    variant="outline"
                                    className="border-orange-500 bg-orange-50 font-bold uppercase tracking-tight text-orange-600"
                                >
                                    <Clock className="mr-1.5 h-3 w-3" />
                                    In 30-Day Notice Period
                                </Badge>
                            )}
                            {activeNotice && activeNotice.status === 'grace_period' && (
                                <Badge variant="outline" className="border-red-500 bg-red-50 font-bold uppercase tracking-tight text-red-600">
                                    <AlertCircle className="mr-1.5 h-3 w-3" />
                                    In 15-Day Final Grace Period
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {activeNotice && customer.status === 'active' && (
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Ban className="h-4 w-4 text-muted-foreground" />
                                Cancel disconnection notice
                            </CardTitle>
                            <CardDescription>
                                Withdraw the active notice and grace timeline. This does not change the customer account status if they are still
                                active.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCancelNotice} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cancel_notice_notes">Notes (optional)</Label>
                                    <Textarea
                                        id="cancel_notice_notes"
                                        placeholder="e.g., Customer settled balance, notice withdrawn"
                                        value={cancelNoticeForm.data.notes}
                                        onChange={(e) => cancelNoticeForm.setData('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" variant="secondary" disabled={cancelNoticeForm.processing}>
                                        Confirm cancel notice
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {customer.status === 'active' && !activeNotice && (
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BellOff className="h-4 w-4 text-orange-600" />
                                Issue disconnection notice
                            </CardTitle>
                            <CardDescription>
                                This starts the 30-day compliance period, followed by an automatic 15-day final grace period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleNotify} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reason">Reason for notice</Label>
                                    <Input
                                        id="reason"
                                        placeholder="e.g., Unpaid balance exceeding 3 months"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Internal notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional context..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700" disabled={processing}>
                                        Issue notice
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {customer.status === 'active' && (
                    <Card className="rounded-xl border border-destructive/30 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-destructive">
                                <PowerOff className="h-4 w-4" />
                                Perform disconnection
                            </CardTitle>
                            <CardDescription>Select the method of disconnection and confirm. Use only when appropriate.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleDisconnect} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="disconnection_type">Disconnection method</Label>
                                    <select
                                        id="disconnection_type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.disconnection_type}
                                        onChange={(e) => setData('disconnection_type', e.target.value)}
                                    >
                                        <option value="water_blocked">Block water (meter stays)</option>
                                        <option value="meter_removed">Remove meter (physical removal)</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="reason_d">Reason</Label>
                                    <Input
                                        id="reason_d"
                                        placeholder="e.g., Non-compliance after 45 days"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" variant="destructive" disabled={processing}>
                                        Confirm disconnection
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {customer.status === 'disconnected' && (
                    <Card className="rounded-xl border border-green-200 bg-green-50/40 shadow-sm dark:border-green-900 dark:bg-green-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-400">
                                <RotateCcw className="h-4 w-4" />
                                Reconnect water service
                            </CardTitle>
                            <CardDescription>Confirm that the customer has complied with requirements.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleReconnect} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="notes_r">Reconnection notes</Label>
                                    <Textarea
                                        id="notes_r"
                                        placeholder="e.g., All balances paid, reconnection fee collected"
                                        value={reconnectForm.data.notes}
                                        onChange={(e) => reconnectForm.setData('notes', e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" className="bg-green-600 text-white hover:bg-green-700" disabled={reconnectForm.processing}>
                                        Confirm reconnection
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {activeNotice && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <h4 className="text-sm font-bold uppercase tracking-tight text-orange-900 dark:text-orange-100">
                                        Two-Phase Notice Timeline
                                    </h4>
                                    <Button variant="outline" size="sm" className="shrink-0 border-orange-300 bg-white/80 text-orange-900 hover:bg-white" asChild>
                                        <a
                                            href={route('customers.print-notification', customer.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Printer className="mr-2 h-3.5 w-3.5" />
                                            Print notice
                                        </a>
                                    </Button>
                                </div>

                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-orange-200 dark:bg-orange-900/50">
                                    <div className="absolute bottom-0 left-0 top-0 w-2/3 bg-orange-500" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                                    <div>
                                        <p className="mb-1 font-medium uppercase text-orange-800/60 dark:text-orange-200/70">
                                            Phase 1: 30 Days Notice
                                        </p>
                                        <p className="font-bold text-orange-900 dark:text-orange-100">
                                            Ends: {formatDate(activeNotice.notice_ends_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 font-medium uppercase text-orange-800/60 dark:text-orange-200/70">
                                            Phase 2: 15 Days Grace
                                        </p>
                                        <p className="font-bold text-orange-900 dark:text-orange-100">
                                            Ends: {formatDate(activeNotice.grace_period_ends_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1 font-medium uppercase text-orange-800/60 dark:text-orange-200/70">Eligibility</p>
                                        <p className="font-black text-red-700 dark:text-red-400">
                                            Disconnection Eligible After {formatDate(activeNotice.grace_period_ends_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Disconnection History</h3>
                </div>

                {!disconnections.length ? (
                    <div className="rounded-lg border border-dashed bg-muted/5 p-8 text-center text-sm text-muted-foreground">
                        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                        <p>No disconnection history found for this account.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {disconnections.map((d) => (
                            <div key={d.id} className="group relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                                <div
                                    className={`absolute bottom-0 left-0 top-0 w-1 ${
                                        d.status === 'reconnected'
                                            ? 'bg-green-500'
                                            : d.status === 'disconnected'
                                              ? 'bg-red-500'
                                              : d.status === 'cancelled'
                                                ? 'bg-slate-400'
                                                : 'bg-orange-500'
                                    }`}
                                />

                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    d.status === 'reconnected'
                                                        ? 'success'
                                                        : d.status === 'disconnected'
                                                          ? 'destructive'
                                                          : d.status === 'cancelled'
                                                            ? 'outline'
                                                            : 'secondary'
                                                }
                                                className="text-[10px] font-black capitalize tracking-widest"
                                            >
                                                {d.status}
                                            </Badge>
                                            {d.disconnection_type && (
                                                <Badge variant="outline" className="text-[10px] font-bold capitalize">
                                                    {d.disconnection_type.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-foreground">{d.reason || 'No reason provided'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-[11px] md:grid-cols-4">
                                        <div>
                                            <p className="font-medium uppercase tracking-tighter text-muted-foreground">Notified</p>
                                            <p className="font-bold">{formatDate(d.notified_at)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium uppercase tracking-tighter text-muted-foreground">Notice Ends</p>
                                            <p className="font-bold">{formatDate(d.notice_ends_at)}</p>
                                        </div>
                                        {d.disconnected_at && (
                                            <div>
                                                <p className="font-medium uppercase tracking-tighter text-muted-foreground">Disconnected</p>
                                                <p className="font-bold text-destructive">{formatDate(d.disconnected_at)}</p>
                                            </div>
                                        )}
                                        {d.reconnected_at && (
                                            <div>
                                                <p className="font-medium uppercase tracking-tighter text-muted-foreground">Reconnected</p>
                                                <p className="font-bold text-green-600">{formatDate(d.reconnected_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {d.notes && (
                                    <div className="-mx-4 mt-3 border-t bg-muted/20 px-4 py-2 pt-3">
                                        <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Internal Notes</p>
                                        <p className="whitespace-pre-line text-xs italic leading-relaxed text-muted-foreground">{d.notes}</p>
                                    </div>
                                )}

                                <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2 text-[10px] text-muted-foreground">
                                    <p className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        By: {d.disconnected_by_user?.name || d.disconnected_by_name || 'System'}
                                    </p>
                                    {d.reconnected_by && (
                                        <p className="flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            Reconnected by: {d.reconnected_by_user?.name || 'Admin'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
