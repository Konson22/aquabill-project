import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { AlertCircle, Activity, Clock } from 'lucide-react';

export default function DisconnectionManagement({ customer }) {
    const disconnections = customer.disconnections || [];
    const activeNotice = disconnections.find((d) => d.status === 'notified' || d.status === 'grace_period');

    return (
        <div className="space-y-6">
            <Card className="rounded-xl border bg-muted/5 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disconnection status</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={customer.status === 'active' ? 'success' : 'destructive'}
                                className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight"
                            >
                                {customer.status}
                            </Badge>
                            {activeNotice && activeNotice.status === 'notified' && (
                                <Badge
                                    variant="outline"
                                    className="border-orange-500 bg-orange-50 text-[10px] font-bold uppercase text-orange-600"
                                >
                                    <Clock className="mr-1 h-3 w-3" />
                                    30-day notice
                                </Badge>
                            )}
                            {activeNotice && activeNotice.status === 'grace_period' && (
                                <Badge variant="outline" className="border-red-500 bg-red-50 text-[10px] font-bold uppercase text-red-600">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Grace period
                                </Badge>
                            )}
                            {!activeNotice && customer.status === 'active' && (
                                <span className="text-xs text-muted-foreground">No active notice</span>
                            )}
                        </div>
                    </div>
                    <Button type="button" variant="outline" className="shrink-0 border-orange-200 dark:text-orange-200" asChild>
                        <Link href={route('customers.disconnection-status', customer.id)}>
                            <Activity className="mr-2 h-4 w-4" />
                            Open disconnection page
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
                Full timeline, actions, and history are on the{' '}
                <Link href={route('customers.disconnection-status', customer.id)} className="font-medium text-primary underline-offset-4 hover:underline">
                    disconnection page
                </Link>
                .
            </p>
        </div>
    );
}
