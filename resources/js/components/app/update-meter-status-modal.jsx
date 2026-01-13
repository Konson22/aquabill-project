import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';

export default function UpdateMeterStatusModal({ meter, trigger }) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors, reset } = useForm({
        status: meter?.status || 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('meters.update', meter.id), {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    if (!meter) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Meter Status</DialogTitle>
                    <DialogDescription>
                        Change the operational status of meter #
                        {meter.meter_number}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(val) => setData('status', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="disconnect">
                                    Disconnected
                                </SelectItem>
                                <SelectItem value="damage">Damaged</SelectItem>
                                <SelectItem value="maintenance">
                                    Maintenance
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <span className="text-xs text-red-500">
                                {errors.status}
                            </span>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Settings2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Settings2 className="mr-2 h-4 w-4" />
                            )}
                            Update Status
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
