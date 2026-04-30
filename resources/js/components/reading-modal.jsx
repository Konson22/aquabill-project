import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MapPin, Activity, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export default function ReadingModal({ customer, isOpen, onClose }) {
    const [selectedMeter, setSelectedMeter] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        meter_id: '',
        current_reading: '',
        reading_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (isOpen && customer?.meters?.length > 0) {
            const meterIdToSelect = data.meter_id || customer.meters[0].id.toString();
            const meter = customer.meters.find(m => m.id.toString() === meterIdToSelect) || customer.meters[0];

            setSelectedMeter(meter);
            setData(prevData => ({
                ...prevData,
                meter_id: meter.id.toString(),
            }));
            clearErrors();
        }
    }, [customer, isOpen]);


    const submit = (e) => {
        e.preventDefault();
        post(route('readings.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Record Meter Reading
                        </DialogTitle>
                        <DialogDescription>
                            Enter the latest consumption data for {customer.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Assigned Meter</Label>
                            {customer.meters?.length > 0 ? (
                                <div className="bg-muted/30 p-3 rounded-lg border flex items-center justify-between h-14">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{customer.meters[0].meter_number}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">
                                            {customer.meters[0].status} • {customer.meters[0].meter_type || 'Standard'}
                                        </span>
                                    </div>
                                    <Activity className="h-4 w-4 text-indigo-500 opacity-50" />
                                </div>
                            ) : (
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        This customer has no active water meters.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Previous Reading Info */}
                        {selectedMeter && (
                            <div className="bg-muted/50 p-3 rounded-lg border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>Previous Reading </span>
                                </div>
                                <span className="font-mono font-bold text-sm">
                                    {selectedMeter.last_reading || 0} m³
                                </span>
                            </div>
                        )}

                        {/* Current Reading */}
                        <div className="grid gap-2">
                            <Label htmlFor="current_reading">Current Reading (m³)</Label>
                            <div className="relative">
                                <Input
                                    id="current_reading"
                                    type="number"
                                    step="0.01"
                                    value={data.current_reading}
                                    onChange={(e) => setData('current_reading', e.target.value)}
                                    placeholder="Enter current meter value..."
                                    className="pr-10"
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                                    m³
                                </div>
                            </div>
                            {errors.current_reading && <p className="text-xs text-red-500">{errors.current_reading}</p>}
                        </div>

                        {/* Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="reading_date">Reading Date</Label>
                            <div className="relative">
                                <Input
                                    id="reading_date"
                                    type="date"
                                    value={data.reading_date}
                                    onChange={(e) => setData('reading_date', e.target.value)}
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                            {errors.reading_date && <p className="text-xs text-red-500">{errors.reading_date}</p>}
                        </div>

                        {/* Warning if current < previous */}
                        {selectedMeter && data.current_reading && parseFloat(data.current_reading) < (selectedMeter.last_reading || 0) && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-[10px]">
                                    Current reading is lower than previous. This will result in 0 consumption.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !customer.meters?.length} className="bg-indigo-600 hover:bg-indigo-700">
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Reading'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
