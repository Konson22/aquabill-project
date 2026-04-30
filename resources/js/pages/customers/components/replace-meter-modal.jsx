import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';

export default function ReplaceMeterModal({ meter, unassignedMeters = [], isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        final_reading: meter?.last_reading || 0,
        reason: 'Faulty Mechanism',
        notes: '',
        new_meter_id: '',
        new_meter_status: 'active',
    });

    // Update final_reading when meter changes
    useEffect(() => {
        if (meter) {
            setData('final_reading', meter.last_reading || 0);
        }
    }, [meter]);

    const submit = (e) => {
        e.preventDefault();
        post(route('meters.replace', meter.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Replace Meter
                        </DialogTitle>
                        <DialogDescription>
                            This will deactivate meter <span className="font-mono font-bold text-primary">{meter?.meter_number}</span> and assign a new one to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="new_meter_id">Select New Meter</Label>
                                <Select value={data.new_meter_id} onValueChange={(value) => setData('new_meter_id', value)}>
                                    <SelectTrigger id="new_meter_id">
                                        <SelectValue placeholder="Choose a meter..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unassignedMeters.length > 0 ? (
                                            unassignedMeters.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    <div className="flex justify-between w-full gap-4">
                                                        {m.meter_number}
                                                    </div>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                                                No unassigned meters available.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.new_meter_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>New Meter Status</Label>
                                <Select value={data.new_meter_status} onValueChange={(value) => setData('new_meter_status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="damage">Damage</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.new_meter_status} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-[10px] uppercase text-indigo-600 font-bold">New Meter Initial Reading</Label>
                            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 font-mono text-sm font-bold flex justify-between items-center text-indigo-700">
                                <span>{unassignedMeters.find(m => m.id.toString() === data.new_meter_id)?.last_reading || 0}</span>
                                <span className="text-xs opacity-50 uppercase">m³</span>
                            </div>
                        </div>

                        {/* Hidden input to satisfy the server-side final_reading requirement for the old meter */}
                        <input type="hidden" value={data.final_reading} name="final_reading" />

                        <div className="grid gap-2">
                            <Label>Reason for Replacement</Label>
                            <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Faulty Mechanism">Faulty Mechanism</SelectItem>
                                    <SelectItem value="Broken Glass">Broken Glass</SelectItem>
                                    <SelectItem value="Leakage">Leakage</SelectItem>
                                    <SelectItem value="Stolen">Stolen</SelectItem>
                                    <SelectItem value="Age/Wear">Age/Wear</SelectItem>
                                    <SelectItem value="Maintenance Upgrade">Maintenance Upgrade</SelectItem>
                                    <SelectItem value="Inaccurate Reading">Inaccurate Reading</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.reason} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} variant="destructive">
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Process Replacement
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
