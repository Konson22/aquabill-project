import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

export default function CustomerMeterForm({ customer, availableMeters = [], onSuccess }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        meter_id: customer?.meter_id || 'none',
        reason: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();

        // Send meter_id, reason, and notes for the update
        put(route('customers.update', customer.id), {
            data: {
                meter_id: data.meter_id === 'none' ? null : data.meter_id,
                reason: data.reason,
                notes: data.notes,
            },
            onSuccess: () => {
                reset();
                // Set the form back to the current customer state
                setData('meter_id', customer?.meter_id || 'none');
                setData('reason', '');
                setData('notes', '');
                if (onSuccess) onSuccess();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
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
                // Set the form back to the current customer state
                setData('meter_id', 'none');
                setData('reason', '');
                setData('notes', '');
                if (onSuccess) onSuccess();
            },
        });
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Meter Assignment for {customer?.first_name} {customer?.last_name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Assign or change the meter for this customer</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="meter_id">Select Meter</Label>
                    <Select value={data.meter_id || 'none'} onValueChange={(value) => setData('meter_id', value === 'none' ? null : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a meter to assign" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Meter</SelectItem>
                            {availableMeters
                                .filter((meter) => {
                                    // Show only meters that are not assigned to any customer
                                    return !meter.customer_id;
                                })
                                .map((meter) => (
                                    <SelectItem key={meter.id} value={meter.id.toString()}>
                                        {meter.serial || `Meter #${meter.id}`} - {meter.status}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.meter_id} />
                    <p className="mt-1 text-xs text-slate-500">
                        Only available meters are shown. Meters already assigned to other customers are marked.
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
                    <Input
                        id="notes"
                        name="notes"
                        type="text"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Enter any additional notes about this meter change"
                    />
                    <InputError message={errors.notes} />
                </div>

                <div className="flex space-x-3 pt-4">
                    <Button type="submit" disabled={processing || !data.meter_id || data.meter_id === 'none'} className="flex-1">
                        {processing ? 'Assigning...' : 'Assign Meter'}
                    </Button>

                    {customer?.meter_id && (
                        <Button type="button" variant="outline" onClick={handleRemoveMeter} disabled={processing} className="flex-1">
                            Remove Meter
                        </Button>
                    )}
                </div>
            </form>

            {/* Current Meter Information */}
            {customer?.meter && (
                <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
                    <h4 className="mb-2 font-medium text-slate-900 dark:text-slate-100">Currently Assigned Meter</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-600 dark:text-slate-400">Serial:</span>
                            <span className="ml-2 font-medium">{customer.meter.serial || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 dark:text-slate-400">Status:</span>
                            <span className="ml-2 font-medium">{customer.meter.status}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 dark:text-slate-400">Type:</span>
                            <span className="ml-2 font-medium">{customer.meter.type?.name || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 dark:text-slate-400">Readings:</span>
                            <span className="ml-2 font-medium">{customer.meter.readings?.length || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Available Meters Summary */}
            <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium text-slate-900 dark:text-slate-100">Available Meters</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>Total meters: {availableMeters.length}</p>
                    <p>Available for assignment: {availableMeters.filter((m) => !m.customer_id).length}</p>
                    <p>Currently assigned: {availableMeters.filter((m) => m.customer_id).length}</p>
                </div>
            </div>
        </div>
    );
}
