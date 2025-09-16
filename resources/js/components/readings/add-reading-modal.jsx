import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Calendar, ChevronDown, Droplets, Hash, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AddReadingModal({ meters }) {
    const [open, setOpen] = useState(false);
    const [meterSearch, setMeterSearch] = useState('');
    const [showMeterDropdown, setShowMeterDropdown] = useState(false);
    const [filteredMeters, setFilteredMeters] = useState(meters);
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [currentReadingError, setCurrentReadingError] = useState('');
    const meterDropdownRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        meter_id: '',
        date: new Date().toISOString().split('T')[0],
        value: '',
        illigal_connection: 0,
        note: '',
        source: 'manual',
    });

    // Filter meters based on search query
    useEffect(() => {
        if (meterSearch.trim() === '') {
            setFilteredMeters(meters);
        } else {
            const filtered = meters.filter(
                (meter) =>
                    meter.serial?.toLowerCase().includes(meterSearch.toLowerCase()) ||
                    meter.id.toString().includes(meterSearch) ||
                    (meter.customer && `${meter.customer.first_name} ${meter.customer.last_name}`.toLowerCase().includes(meterSearch.toLowerCase())),
            );
            setFilteredMeters(filtered);
        }
    }, [meterSearch, meters]);

    // Handle click outside to close dropdown
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
        setData('meter_id', meter.id);
        setMeterSearch(meter.serial);
        setSelectedMeter(meter);
        setCurrentReadingError(''); // Clear error when selecting new meter
        setShowMeterDropdown(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert string values to integers for IDs
        const formData = {
            ...data,
            meter_id: parseInt(data.meter_id) || '',
            value: parseFloat(data.value) || '',
        };

        // Client-side validation: Check if current reading is not less than previous reading
        if (selectedMeter && formData.value < selectedMeter.previous_reading) {
            setCurrentReadingError(`Current reading cannot be less than previous reading (${selectedMeter.previous_reading.toLocaleString()})`);
            return;
        }

        post('/readings', {
            data: formData,
            onSuccess: () => {
                setOpen(false);
                reset();
                setMeterSearch('');
                setSelectedMeter(null);
                setCurrentReadingError('');
            },
            onError: () => {
                // Keep modal open if there are errors
            },
        });
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            reset();
            setMeterSearch('');
            setSelectedMeter(null);
            setCurrentReadingError('');
        }
    };

    const handleInputChange = (field, value) => {
        setData(field, value);

        // Real-time validation for current reading
        if (field === 'value' && selectedMeter) {
            const currentValue = parseFloat(value) || 0;
            if (currentValue < selectedMeter.previous_reading) {
                setCurrentReadingError(`Current reading cannot be less than previous reading (${selectedMeter.previous_reading.toLocaleString()})`);
            } else {
                setCurrentReadingError('');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reading
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        Add New Meter Reading
                    </DialogTitle>
                    <DialogDescription>Enter the current meter reading to track water consumption.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Meter Selection */}
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
                                    required
                                />
                                <ChevronDown className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Hidden input for form submission */}
                            <input type="hidden" name="meter_id" value={data.meter_id} />

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
                                                <div className="font-medium text-slate-900">{meter.serial || meter.name}</div>
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <span>ID: {meter.id}</span>
                                                    <span className="text-blue-600">Prev: {meter.previous_reading.toLocaleString()}</span>
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

                        {/* Previous Reading Display */}
                        {selectedMeter && (
                            <div className="mt-2 rounded-md bg-blue-50 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Droplets className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-blue-900">Previous Reading:</span>
                                    <span className="text-blue-700">{selectedMeter.previous_reading.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reading Date */}
                    <div className="space-y-2">
                        <Label htmlFor="reading_date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Reading Date
                        </Label>
                        <Input
                            id="reading_date"
                            name="reading_date"
                            type="date"
                            value={data.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            required
                        />
                        <InputError message={errors.date} />
                    </div>

                    {/* Current Reading */}
                    <div className="space-y-2">
                        <Label htmlFor="value" className="flex items-center gap-2">
                            <Droplets className="h-4 w-4" />
                            Current Reading
                        </Label>
                        <Input
                            id="value"
                            name="value"
                            type="number"
                            step="0.01"
                            min={selectedMeter ? selectedMeter.previous_reading : 0}
                            value={data.value}
                            onChange={(e) => handleInputChange('value', e.target.value)}
                            placeholder="Enter current meter reading"
                            className={`h-12 w-full bg-white px-3 ${currentReadingError ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                            required
                        />
                        <InputError message={errors.value || currentReadingError} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Reading'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
