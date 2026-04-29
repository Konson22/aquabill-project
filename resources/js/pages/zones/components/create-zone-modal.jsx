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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { MapPin, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';

export default function CreateZoneModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        supply_day: '',
        supply_time: '',
        description: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('zones.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const days = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Daily'
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] animate-in fade-in zoom-in duration-300">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            <MapPin className="h-5 w-5 text-red-500" />
                            Create New Zone
                        </DialogTitle>
                        <DialogDescription>
                            Define a new geographic billing area and its water supply schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Zone Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Block 7 Central"
                                className="rounded-xl"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Supply Day</Label>
                                <Select 
                                    value={data.supply_day} 
                                    onValueChange={(val) => setData('supply_day', val)}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map(day => (
                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.supply_day} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="supply_time">Supply Time</Label>
                                <Input
                                    id="supply_time"
                                    value={data.supply_time}
                                    onChange={(e) => setData('supply_time', e.target.value)}
                                    placeholder="e.g. 08:00 - 12:00"
                                    className="rounded-xl"
                                />
                                <InputError message={errors.supply_time} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select 
                                value={data.status} 
                                onValueChange={(val) => setData('status', val)}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Details about the zone boundaries or specific instructions..."
                                className="rounded-xl min-h-[100px]"
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 font-bold"
                        >
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Zone
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
