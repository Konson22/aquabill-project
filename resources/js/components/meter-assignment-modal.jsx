import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { ChevronDown, Droplets, Hash, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function MeterAssignmentModal({ customer, availableMeters = [], trigger }) {
    const [open, setOpen] = useState(false);
    const [meterSearch, setMeterSearch] = useState('');
    const [showMeterDropdown, setShowMeterDropdown] = useState(false);
    const [filteredMeters, setFilteredMeters] = useState(availableMeters);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const meterDropdownRef = useRef(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        meter_id: '',
        reason: '',
        notes: '',
    });

    // Only show meters that are unassigned or assigned to this customer
    const visibleMeters = availableMeters.filter((meter) => !meter.customer_id || meter.customer_id === customer.id);

    useEffect(() => {
        if (meterSearch.trim() === '') {
            setFilteredMeters(visibleMeters);
        } else {
            const q = meterSearch.toLowerCase();
            const filtered = visibleMeters.filter(
                (meter) =>
                    (meter.serial && meter.serial.toLowerCase().includes(q)) ||
                    meter.id.toString().includes(meterSearch) ||
                    (meter.customer_name && meter.customer_name.toLowerCase().includes(q)),
            );
            setFilteredMeters(filtered);
        }
    }, [meterSearch, availableMeters]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (meterDropdownRef.current && !meterDropdownRef.current.contains(event.target)) {
                setShowMeterDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMeterSelect = (meter) => {
        setData('meter_id', meter?.id ?? null);
        setMeterSearch(meter?.serial || `Meter #${meter?.id}`);
        setSelectedMeter(meter);
        setShowMeterDropdown(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('customers.update', customer.id), {
            data: {
                meter_id: data.meter_id === 'none' ? null : data.meter_id,
                reason: data.reason,
                notes: data.notes,
            },
            onSuccess: () => {
                reset();
                setOpen(false);
                setMeterSearch('');
                setSelectedMeter(null);
                setShowMeterDropdown(false);
            },
        });
    };

    const handleRemoveMeter = () => {
        put(route('customers.update', customer.id), {
            data: {
                meter_id: null,
                reason: data.reason || 'Meter removal',
                notes: data.notes || 'Meter removed from customer',
            },
            onSuccess: () => {
                reset();
                setOpen(false);
                setMeterSearch('');
                setSelectedMeter(null);
                setShowMeterDropdown(false);
            },
        });
    };

    const resetForm = () => {
        reset();
        setData('meter_id', customer?.meter_id || '');
        setData('reason', '');
        setData('notes', '');
        const currentMeter = visibleMeters.find((m) => m.id === customer?.meter_id) || null;
        setSelectedMeter(currentMeter || null);
        setMeterSearch(currentMeter ? currentMeter.serial || `Meter #${currentMeter.id}` : '');
        setShowMeterDropdown(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            resetForm();
        } else {
            // Initialize the form when opened
            const currentMeter = visibleMeters.find((m) => m.id === customer?.meter_id) || null;
            setSelectedMeter(currentMeter || null);
            setMeterSearch(currentMeter ? currentMeter.serial || `Meter #${currentMeter.id}` : '');
            setData('meter_id', currentMeter ? currentMeter.id : '');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Manage Meters
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        <span>Meter Management</span>
                    </DialogTitle>
                    <DialogDescription>
                        Assign or change the meter for {customer.first_name} {customer.last_name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Meter Selection (Searchable) */}
                    <div className="space-y-2">
                        <Label htmlFor="meter_search" className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Meter
                        </Label>
                        <div className="relative" ref={meterDropdownRef}>
                            <div className="relative bg-white">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 bg-white text-gray-400" />
                                <Input
                                    id="meter_search"
                                    name="meter_search"
                                    type="text"
                                    value={meterSearch}
                                    onChange={(e) => {
                                        setMeterSearch(e.target.value);
                                        setShowMeterDropdown(true);
                                    }}
                                    onFocus={() => setShowMeterDropdown(true)}
                                    placeholder="Search meters by ID or customer name..."
                                    className="h-12 w-full pr-10 pl-10"
                                />
                                <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Hidden input for submission */}
                            <input type="hidden" name="meter_id" value={data.meter_id ?? ''} />

                            {/* Dropdown */}
                            {showMeterDropdown && (
                                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                                    {filteredMeters.length > 0 ? (
                                        filteredMeters.map((meter) => (
                                            <div
                                                key={meter.id}
                                                className="cursor-pointer border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50"
                                                onClick={() => handleMeterSelect(meter)}
                                            >
                                                <div className="font-medium text-slate-900">{meter.serial || `Meter #${meter.id}`}</div>
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <span>ID: {meter.id}</span>
                                                    <span className="text-slate-600">
                                                        {meter.customer_name ? `Assigned to ${meter.customer_name}` : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-slate-500">No meters found matching "{meterSearch}"</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <InputError message={errors.meter_id} />
                        <p className="mt-1 text-xs text-slate-500">
                            Only available meters are shown. Meters already assigned to other customers are hidden.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="reason">Reason for Change</Label>
                        <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason for the meter change" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new_installation">New Installation</SelectItem>
                                <SelectItem value="meter_replacement">Meter Replacement</SelectItem>
                                <SelectItem value="customer_request">Customer Request</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="upgrade">Upgrade</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.reason} />
                    </div>

                    <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Enter any additional notes about this meter change"
                            rows={3}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button type="submit" disabled={processing || !data.meter_id} className="flex-1">
                            {processing ? 'Assigning...' : 'Assign Meter'}
                        </Button>

                        {customer?.meter_id && (
                            <Button type="button" variant="outline" onClick={handleRemoveMeter} disabled={processing} className="flex-1">
                                Remove Meter
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
