import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Calendar, Droplets, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SimpleMeterReadingForm({ meter, onSubmit, onCancel, errors = {} }) {
    const [previousReading, setPreviousReading] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        meter_id: meter?.id || '',
        date: new Date().toISOString().split('T')[0],
        value: '',
        source: 'manual_reading',
    });

    // Initialize with meter data
    useEffect(() => {
        if (meter) {
            setData('meter_id', meter.id);

            // Prefer explicit previous_reading if provided on meter
            if (typeof meter.previous_reading !== 'undefined' && meter.previous_reading !== null) {
                setPreviousReading(parseFloat(meter.previous_reading) || 0);
                return;
            }

            // Derive previous reading from meter.readings if available
            if (Array.isArray(meter.readings) && meter.readings.length > 0) {
                // Try to pick the most recent by date, then by id, else by highest value
                const readings = [...meter.readings];
                let latest = null;
                if (readings[0] && readings[0].date) {
                    latest = readings.reduce((acc, r) => (acc === null || new Date(r.date) > new Date(acc.date) ? r : acc), null);
                } else if (readings[0] && typeof readings[0].id !== 'undefined') {
                    latest = readings.reduce((acc, r) => (acc === null || r.id > acc.id ? r : acc), null);
                }
                if (!latest) {
                    latest = readings.reduce((acc, r) => (acc === null || parseFloat(r.value || 0) > parseFloat(acc.value || 0) ? r : acc), null);
                }
                const latestValue = latest ? latest.value : 0;
                setPreviousReading(parseFloat(latestValue) || 0);
            } else {
                setPreviousReading(0);
            }
        }
    }, [meter]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Submitting form data:', data);

        post('/readings', {
            onSuccess: () => {
                console.log('Reading saved successfully');
                reset();
                if (onSubmit) onSubmit();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
        });
    };

    // Calculate consumption
    const consumption = data.value && previousReading ? parseFloat(data.value) - previousReading : 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Previous Reading Display */}
            {meter && (
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 text-sm">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Previous Reading:</span>
                        <span className="text-blue-700 dark:text-blue-300">{previousReading.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">Meter: {meter.serial || meter.id}</div>
                </div>
            )}

            {/* Reading Date */}
            <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Reading Date
                </Label>
                <Input id="date" name="date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                {errors.date && <InputError message={errors.date} />}
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
                    min="0"
                    value={data.value}
                    onChange={(e) => setData('value', e.target.value)}
                    placeholder="Enter current meter reading"
                    required
                />
                {errors.value && <InputError message={errors.value} />}

                {/* Consumption Preview */}
                {data.value && previousReading > 0 && (
                    <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                        <div className="flex items-center gap-2 text-sm">
                            <Droplets className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-900 dark:text-green-100">Consumption:</span>
                            <span className="text-green-700 dark:text-green-300">{consumption.toLocaleString()} units</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={processing} className="gap-2">
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save Reading'}
                </Button>
            </div>
        </form>
    );
}
