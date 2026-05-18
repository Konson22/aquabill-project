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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';

export default function EditMeterModal({ meter, isOpen, onClose }) {
    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        meter_number: '',
        last_reading: '0',
        status: 'active',
    });

    useEffect(() => {
        if (meter) {
            setData({
                meter_number: meter.meter_number ?? '',
                last_reading: String(meter.last_reading ?? '0'),
                status: meter.status ?? 'active',
            });
        }
    }, [meter]);

    const handleOpenChange = (open) => {
        if (!open) {
            reset();
            clearErrors();
            onClose();
        }
    };

    const submit = (event) => {
        event.preventDefault();
        if (!meter) {
            return;
        }

        patch(route('meters.update', meter.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Edit Meter</DialogTitle>
                        <DialogDescription>
                            Update meter details for{' '}
                            <span className="font-mono font-bold text-primary">{meter?.meter_number}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_meter_number">Meter Number</Label>
                        <Input
                            id="edit_meter_number"
                            value={data.meter_number}
                            onChange={(event) => setData('meter_number', event.target.value)}
                            placeholder="Enter meter number"
                            required
                        />
                        {errors.meter_number && (
                            <p className="text-sm text-destructive">{errors.meter_number}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_last_reading">Last Reading (m³)</Label>
                        <Input
                            id="edit_last_reading"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.last_reading}
                            onChange={(event) => setData('last_reading', event.target.value)}
                            placeholder="0.00"
                        />
                        {errors.last_reading && (
                            <p className="text-sm text-destructive">{errors.last_reading}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
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
                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
