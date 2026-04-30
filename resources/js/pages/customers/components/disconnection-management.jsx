import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { 
    AlertCircle, 
    BellOff, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    FileText, 
    PowerOff, 
    RotateCcw,
    Activity,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function DisconnectionManagement({ customer }) {
    const disconnections = customer.disconnections || [];
    const activeDisconnection = disconnections.find(d => d.status === 'notified' || d.status === 'disconnected');
    
    const { data, setData, post, processing, reset } = useForm({
        reason: '',
        notes: '',
        disconnection_type: 'water_blocked',
    });

    const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false);

    const handleNotify = (e) => {
        e.preventDefault();
        post(route('customers.notify-disconnection', customer.id), {
            onSuccess: () => {
                setIsNotifyModalOpen(false);
                reset();
            }
        });
    };

    const handleDisconnect = (e) => {
        e.preventDefault();
        post(route('customers.disconnect', customer.id), {
            onSuccess: () => {
                setIsDisconnectModalOpen(false);
                reset();
            }
        });
    };

    const handleReconnect = (e) => {
        e.preventDefault();
        post(route('customers.reconnect', customer.id), {
            onSuccess: () => {
                setIsReconnectModalOpen(false);
                reset();
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Current Status Card */}
            <Card className="border-2 border-dashed bg-muted/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Disconnection Status
                    </CardTitle>
                    <CardDescription>
                        Manage notices and actual disconnections (30 days notice + 15 days grace).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Status</p>
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant={customer.status === 'active' ? 'success' : 'destructive'}
                                    className="px-3 py-1 text-sm font-bold uppercase tracking-tight"
                                >
                                    {customer.status}
                                </Badge>
                                {activeDisconnection && activeDisconnection.status === 'notified' && (
                                    <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50 font-bold uppercase tracking-tight">
                                        <Clock className="mr-1.5 h-3 w-3" />
                                        In 30-Day Notice Period
                                    </Badge>
                                )}
                                {activeDisconnection && activeDisconnection.status === 'grace_period' && (
                                    <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 font-bold uppercase tracking-tight">
                                        <AlertCircle className="mr-1.5 h-3 w-3" />
                                        In 15-Day Final Grace Period
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {customer.status === 'active' && !activeDisconnection && (
                                <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs">
                                            <BellOff className="mr-2 h-4 w-4" />
                                            Start 30/15 Notice
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Issue Disconnection Notice</DialogTitle>
                                            <DialogDescription>
                                                This starts the 30-day compliance period, followed by an automatic 15-day final grace period.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleNotify} className="space-y-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="reason">Reason for Notice</Label>
                                                <Input 
                                                    id="reason" 
                                                    placeholder="e.g., Unpaid balance exceeding 3 months" 
                                                    value={data.reason}
                                                    onChange={e => setData('reason', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">Internal Notes</Label>
                                                <Textarea 
                                                    id="notes" 
                                                    placeholder="Add any additional context..." 
                                                    value={data.notes}
                                                    onChange={e => setData('notes', e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsNotifyModalOpen(false)}>Cancel</Button>
                                                <Button type="submit" className="bg-orange-600 text-white" disabled={processing}>Issue Notice</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {customer.status === 'active' && (
                                <Dialog open={isDisconnectModalOpen} onOpenChange={setIsDisconnectModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="font-bold uppercase tracking-widest text-xs">
                                            <PowerOff className="mr-2 h-4 w-4" />
                                            Disconnect Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="text-destructive">Perform Disconnection</DialogTitle>
                                            <DialogDescription>
                                                Select the method of disconnection and confirm action.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleDisconnect} className="space-y-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="disconnection_type">Disconnection Method</Label>
                                                <select 
                                                    id="disconnection_type"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={data.disconnection_type}
                                                    onChange={e => setData('disconnection_type', e.target.value)}
                                                >
                                                    <option value="water_blocked">Block Water (Meter Stays)</option>
                                                    <option value="meter_removed">Remove Meter (Physical Removal)</option>
                                                </select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="reason_d">Reason</Label>
                                                <Input 
                                                    id="reason_d" 
                                                    placeholder="e.g., Non-compliance after 45 days" 
                                                    value={data.reason}
                                                    onChange={e => setData('reason', e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsDisconnectModalOpen(false)}>Cancel</Button>
                                                <Button type="submit" variant="destructive" disabled={processing}>Confirm Disconnection</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {customer.status === 'disconnected' && (
                                <Dialog open={isReconnectModalOpen} onOpenChange={setIsReconnectModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-xs">
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reconnect Customer
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="text-green-600">Reconnect Water Service</DialogTitle>
                                            <DialogDescription>
                                                Confirm that the customer has complied with requirements.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleReconnect} className="space-y-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes_r">Reconnection Notes</Label>
                                                <Textarea 
                                                    id="notes_r" 
                                                    placeholder="e.g., All balances paid, reconnection fee collected" 
                                                    value={data.notes}
                                                    onChange={e => setData('notes', e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsReconnectModalOpen(false)}>Cancel</Button>
                                                <Button type="submit" className="bg-green-600 text-white" disabled={processing}>Confirm Reconnection</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>

                    {activeDisconnection && (activeDisconnection.status === 'notified' || activeDisconnection.status === 'grace_period') && (
                        <div className="mt-6 p-4 rounded-lg bg-orange-50 border border-orange-200 animate-in slide-in-from-top-2">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div className="flex-1 space-y-4">
                                    <h4 className="text-sm font-bold text-orange-900 uppercase tracking-tight">Two-Phase Notice Timeline</h4>
                                    
                                    <div className="relative h-2 w-full bg-orange-200 rounded-full overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 bg-orange-500 w-2/3" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="text-orange-800/60 font-medium uppercase mb-1">Phase 1: 30 Days Notice</p>
                                            <p className="font-bold text-orange-900">Ends: {formatDate(activeDisconnection.notice_ends_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-orange-800/60 font-medium uppercase mb-1">Phase 2: 15 Days Grace</p>
                                            <p className="font-bold text-orange-900">Ends: {formatDate(activeDisconnection.grace_period_ends_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-orange-800/60 font-medium uppercase mb-1">Eligibility</p>
                                            <p className="font-black text-red-700">Disconnection Eligible After {formatDate(activeDisconnection.grace_period_ends_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* History Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Disconnection History</h3>
                </div>

                {!disconnections.length ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                        <p>No disconnection history found for this account.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {disconnections.map((d) => (
                            <div key={d.id} className="rounded-lg border bg-card p-4 shadow-sm relative overflow-hidden group">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                    d.status === 'reconnected' ? 'bg-green-500' : 
                                    d.status === 'disconnected' ? 'bg-red-500' : 
                                    'bg-orange-500'
                                }`} />
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                d.status === 'reconnected' ? 'success' : 
                                                d.status === 'disconnected' ? 'destructive' : 
                                                'secondary'
                                            } className="capitalize text-[10px] font-black tracking-widest">
                                                {d.status}
                                            </Badge>
                                            {d.disconnection_type && (
                                                <Badge variant="outline" className="capitalize text-[10px] font-bold">
                                                    {d.disconnection_type.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-foreground">
                                            {d.reason || 'No reason provided'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                                        <div>
                                            <p className="text-muted-foreground font-medium uppercase tracking-tighter">Notified</p>
                                            <p className="font-bold">{formatDate(d.notified_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground font-medium uppercase tracking-tighter">Notice Ends</p>
                                            <p className="font-bold">{formatDate(d.notice_ends_at)}</p>
                                        </div>
                                        {d.disconnected_at && (
                                            <div>
                                                <p className="text-muted-foreground font-medium uppercase tracking-tighter">Disconnected</p>
                                                <p className="font-bold text-destructive">{formatDate(d.disconnected_at)}</p>
                                            </div>
                                        )}
                                        {d.reconnected_at && (
                                            <div>
                                                <p className="text-muted-foreground font-medium uppercase tracking-tighter">Reconnected</p>
                                                <p className="font-bold text-green-600">{formatDate(d.reconnected_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {d.notes && (
                                    <div className="mt-3 pt-3 border-t bg-muted/20 -mx-4 px-4 py-2">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Internal Notes</p>
                                        <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-line">
                                            {d.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t pt-2 border-dashed">
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


