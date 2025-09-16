import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Droplets, Hash, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';

const breadcrumbs = [
    {
        title: 'Readings',
        href: '/readings',
    },
    {
        title: 'Add Reading',
        href: '/readings/create',
    },
];

export default function CreateReadingPage({ meters, errors }) {
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [previousReading, setPreviousReading] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        meter_id: '',
        date: new Date().toISOString().split('T')[0],
        value: '',
        source: 'manual',
        notes: '',
    });

    // Handle meter selection
    const handleMeterChange = (meterId) => {
        const meter = meters.find(m => m.id == meterId);
        setSelectedMeter(meter);
        setPreviousReading(meter?.previous_reading || 0);
        setData('meter_id', meterId);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post('/readings', {
            onSuccess: () => {
                reset();
                setSelectedMeter(null);
                setPreviousReading(0);
            },
        });
    };

    // Calculate consumption
    const consumption = data.value && previousReading ? parseFloat(data.value) - previousReading : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Meter Reading" />

            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Add New Meter Reading
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Record a new meter reading to track water consumption
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5 text-blue-600" />
                                        Reading Details
                                    </CardTitle>
                                    <CardDescription>
                                        Enter the meter reading information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Meter Selection */}
                                    <div className="space-y-2">
                                        <Label htmlFor="meter_id" className="flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            Select Meter
                                        </Label>
                                        <Select value={data.meter_id} onValueChange={handleMeterChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a meter" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {meters.map((meter) => (
                                                    <SelectItem key={meter.id} value={meter.id}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {meter.serial}
                                                            </span>
                                                            <span className="text-sm text-slate-500">
                                                                {meter.customer ? 
                                                                    `${meter.customer.first_name} ${meter.customer.last_name}` : 
                                                                    'No Customer Assigned'
                                                                }
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.meter_id} />
                                    </div>

                                    {/* Previous Reading Display */}
                                    {selectedMeter && (
                                        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Droplets className="h-4 w-4 text-blue-600" />
                                                <span className="font-medium text-blue-900 dark:text-blue-100">
                                                    Previous Reading:
                                                </span>
                                                <span className="text-blue-700 dark:text-blue-300">
                                                    {previousReading.toLocaleString()}
                                                </span>
                                            </div>
                                            {selectedMeter.customer && (
                                                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                                    Customer: {selectedMeter.customer.first_name} {selectedMeter.customer.last_name}
                                                    {selectedMeter.customer.account_number && (
                                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                                            (Account: {selectedMeter.customer.account_number})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Reading Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Reading Date
                                        </Label>
                                        <Input
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
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
                                            min={previousReading}
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            placeholder="Enter current meter reading"
                                            required
                                        />
                                        <InputError message={errors.value} />
                                        
                                        {/* Consumption Preview */}
                                        {data.value && previousReading && (
                                            <div className="mt-2 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Droplets className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-900 dark:text-green-100">
                                                        Consumption:
                                                    </span>
                                                    <span className="text-green-700 dark:text-green-300">
                                                        {consumption.toLocaleString()} units
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Source */}
                                    <div className="space-y-2">
                                        <Label htmlFor="source">Reading Source</Label>
                                        <Select value={data.source} onValueChange={(value) => setData('source', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual Reading</SelectItem>
                                                <SelectItem value="mobile_app">Mobile App</SelectItem>
                                                <SelectItem value="smart_meter">Smart Meter</SelectItem>
                                                <SelectItem value="estimated">Estimated</SelectItem>
                                                <SelectItem value="customer_reading">Customer Reading</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.source} />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Any additional information about this reading..."
                                            rows={3}
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reading Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedMeter ? (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">Meter:</span>
                                                    <span className="font-medium">{selectedMeter.serial}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">Previous:</span>
                                                    <span className="font-medium">{previousReading.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">Current:</span>
                                                    <span className="font-medium">{data.value || 'Not set'}</span>
                                                </div>
                                                {data.value && (
                                                    <div className="flex justify-between text-sm border-t pt-2">
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">Consumption:</span>
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                                            {consumption.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-slate-500 dark:text-slate-400">
                                            Select a meter to see summary
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button 
                                        type="submit" 
                                        className="w-full bg-blue-600 hover:bg-blue-700" 
                                        disabled={processing || !data.meter_id || !data.value}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Saving...' : 'Save Reading'}
                                    </Button>
                                    
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
