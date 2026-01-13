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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AssignMeterModal({
    show,
    onClose,
    homeId,
    onSuccess,
    availableMeters = [],
}) {
    const [activeTab, setActiveTab] = useState('existing');

    useEffect(() => {
        if (availableMeters.length > 0) {
            setActiveTab('existing');
        } else {
            setActiveTab('new');
        }
    }, [availableMeters.length, show]);

    // Form for creating new meter
    const {
        data: newData,
        setData: setNewData,
        post: postNew,
        processing: newProcessing,
        errors: newErrors,
        reset: resetNew,
    } = useForm({
        meter_number: '',
        meter_type: 'Analog',
        initial_reading: '',
        home_id: '',
        status: 'active',
    });

    // Form for assigning existing meter
    const {
        data: existingData,
        setData: setExistingData,
        put: putExisting,
        processing: existingProcessing,
        errors: existingErrors,
        reset: resetExisting,
    } = useForm({
        meter_id: '',
        home_id: '',
        initial_reading: '',
    });

    useEffect(() => {
        if (homeId) {
            setNewData('home_id', homeId);
            setExistingData('home_id', homeId);
        }
    }, [homeId]);

    const submitNew = (e) => {
        e.preventDefault();
        postNew(route('meters.store'), {
            onSuccess: () => {
                resetNew();
                onClose();
                if (onSuccess) onSuccess();
            },
        });
    };

    const submitExisting = (e) => {
        e.preventDefault();
        if (!existingData.meter_id) return;

        putExisting(route('meters.update', existingData.meter_id), {
            onSuccess: () => {
                resetExisting();
                onClose();
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Meter</DialogTitle>
                    <DialogDescription>
                        Create a new meter or assign an existing one to this
                        property.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="mb-4 grid w-full grid-cols-2">
                        <TabsTrigger value="existing">
                            Assign Existing Meter
                        </TabsTrigger>
                        <TabsTrigger value="new">Create New Meter</TabsTrigger>
                    </TabsList>

                    <TabsContent value="existing">
                        <form
                            onSubmit={submitExisting}
                            className="grid gap-4 py-4"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="meter_select">
                                    Select Meter
                                </Label>
                                <Select
                                    value={existingData.meter_id}
                                    onValueChange={(val) =>
                                        setExistingData('meter_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a meter..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableMeters.length > 0 ? (
                                            availableMeters.map((meter) => (
                                                <SelectItem
                                                    key={meter.id}
                                                    value={meter.id.toString()}
                                                >
                                                    {meter.meter_number} (
                                                    {meter.meter_type})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>
                                                No available meters
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {existingErrors.home_id && (
                                    <span className="text-xs text-red-500">
                                        {existingErrors.home_id}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="existing_initial_reading">
                                    Initial Reading
                                </Label>
                                <Input
                                    id="existing_initial_reading"
                                    type="number"
                                    step="0.01"
                                    value={existingData.initial_reading}
                                    onChange={(e) =>
                                        setExistingData(
                                            'initial_reading',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                />
                                {existingErrors.initial_reading && (
                                    <span className="text-xs text-red-500">
                                        {existingErrors.initial_reading}
                                    </span>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={
                                        existingProcessing ||
                                        availableMeters.length === 0
                                    }
                                >
                                    Assign Meter
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="new">
                        <form onSubmit={submitNew} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="meter_number">
                                    Meter Serial Number
                                </Label>
                                <Input
                                    id="meter_number"
                                    value={newData.meter_number}
                                    onChange={(e) =>
                                        setNewData(
                                            'meter_number',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. SN-123456"
                                />
                                {newErrors.meter_number && (
                                    <span className="text-xs text-red-500">
                                        {newErrors.meter_number}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="meter_type">Meter Type</Label>
                                <Select
                                    value={newData.meter_type}
                                    onValueChange={(val) =>
                                        setNewData('meter_type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Analog">
                                            Analog
                                        </SelectItem>
                                        <SelectItem value="Digital">
                                            Digital
                                        </SelectItem>
                                        <SelectItem value="Smart">
                                            Smart
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {newErrors.meter_type && (
                                    <span className="text-xs text-red-500">
                                        {newErrors.meter_type}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="new_initial_reading">
                                    Initial Reading
                                </Label>
                                <Input
                                    id="new_initial_reading"
                                    type="number"
                                    step="0.01"
                                    value={newData.initial_reading}
                                    onChange={(e) =>
                                        setNewData(
                                            'initial_reading',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="0.00"
                                />
                                {newErrors.initial_reading && (
                                    <span className="text-xs text-red-500">
                                        {newErrors.initial_reading}
                                    </span>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={newProcessing}>
                                    Create & Assign
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
