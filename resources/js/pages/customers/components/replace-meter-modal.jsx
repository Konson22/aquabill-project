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
import InputError from '@/components/input-error';

export default function ReplaceMeterModal({ meter, isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        final_reading: '',
        reason: 'Faulty Mechanism',
        notes: '',
        new_meter_number: '',
        new_meter_status: 'active',
    });

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
                                <Label htmlFor="new_meter_number">New Meter Number</Label>
                                <Input
                                    id="new_meter_number"
                                    value={data.new_meter_number}
                                    onChange={(e) => setData('new_meter_number', e.target.value)}
                                    placeholder="WTR-..."
                                />
                                <InputError message={errors.new_meter_number} />
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
                            <Label htmlFor="final_reading">Final Reading for Old Meter</Label>
                            <Input
                                id="final_reading"
                                type="number"
                                step="0.01"
                                value={data.final_reading}
                                onChange={(e) => setData('final_reading', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.final_reading} />
                        </div>

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
