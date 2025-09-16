import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';

export default function MeterAssignmentForm({ customer, availableMeters = [], isEditing = false }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        customer_id: customer?.id || '',
        old_meter_id: '',
        new_meter_id: '',
        action_type: 'initial_assignment',
        reason: '',
        effective_date: new Date().toISOString().split('T')[0],
        installation_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!data.action_type || data.action_type === '') {
            return;
        }

        if (
            (data.action_type === 'initial_assignment' || data.action_type === 'meter_replacement' || data.action_type === 'meter_reactivation') &&
            !data.new_meter_id
        ) {
            return;
        }

        // Create meter log entry
        post(route('meter-logs.store'), {
            onSuccess: () => {
                // If this is a new meter assignment, also update the meter's customer_id
                if (data.new_meter_id && data.action_type === 'initial_assignment') {
                    // Update the meter to assign it to the customer
                    // This would typically be handled in the backend controller
                }
                reset();
            },
        });
    };

    const getActionTypeLabel = (actionType) => {
        const labels = {
            initial_assignment: 'Initial Assignment',
            meter_replacement: 'Meter Replacement',
            meter_removal: 'Meter Removal',
            meter_reactivation: 'Meter Reactivation',
            meter_transfer: 'Meter Transfer',
            maintenance: 'Maintenance',
            upgrade: 'Upgrade',
            downgrade: 'Downgrade',
        };
        return labels[actionType] || actionType;
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                <form className="space-y-4 p-6" onSubmit={submit}>
                    {/* Customer Information */}
                    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                        <h3 className="mb-2 font-medium">Customer Information</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {customer?.first_name} {customer?.last_name} - {customer?.account_number}
                        </p>
                    </div>

                    {/* Action Type */}
                    <div>
                        <Label htmlFor="action_type">Action Type *</Label>
                        <Select value={data.action_type || 'initial_assignment'} onValueChange={(value) => setData('action_type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="initial_assignment">Initial Assignment</SelectItem>
                                <SelectItem value="meter_replacement">Meter Replacement</SelectItem>
                                <SelectItem value="meter_removal">Meter Removal</SelectItem>
                                <SelectItem value="meter_reactivation">Meter Reactivation</SelectItem>
                                <SelectItem value="meter_transfer">Meter Transfer</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="upgrade">Upgrade</SelectItem>
                                <SelectItem value="downgrade">Downgrade</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.action_type} />
                    </div>

                    {/* Old Meter (for replacements/removals) */}
                    {(data.action_type === 'meter_replacement' || data.action_type === 'meter_removal' || data.action_type === 'meter_transfer') && (
                        <div>
                            <Label htmlFor="old_meter_id">Current Meter</Label>
                            <Select value={data.old_meter_id || ''} onValueChange={(value) => setData('old_meter_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select current meter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customer?.meters && customer.meters.length > 0 ? (
                                        customer.meters.map((meter) => (
                                            <SelectItem key={meter.id} value={meter.id.toString()}>
                                                {meter.meter_number} - {meter.serial || 'No Serial'}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no_meters" disabled>
                                            No meters assigned to customer
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.old_meter_id} />
                        </div>
                    )}

                    {/* New Meter (for assignments/replacements) */}
                    {(data.action_type === 'initial_assignment' ||
                        data.action_type === 'meter_replacement' ||
                        data.action_type === 'meter_reactivation') && (
                        <div>
                            <Label htmlFor="new_meter_id">New Meter *</Label>
                            <Select value={data.new_meter_id || ''} onValueChange={(value) => setData('new_meter_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select available meter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMeters && availableMeters.length > 0 ? (
                                        availableMeters.map((meter) => (
                                            <SelectItem key={meter.id} value={meter.id.toString()}>
                                                {meter.meter_number} - {meter.serial || 'No Serial'} ({meter.status || 'Unknown'})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no_available_meters" disabled>
                                            No available meters found
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.new_meter_id} />
                            {(!availableMeters || availableMeters.length === 0) && (
                                <p className="text-sm text-red-600">No available meters found. Please add meters first.</p>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                            id="reason"
                            name="reason"
                            type="text"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Enter reason for this action"
                        />
                        <InputError message={errors.reason} />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="effective_date">Effective Date *</Label>
                            <Input
                                id="effective_date"
                                name="effective_date"
                                type="date"
                                required
                                value={data.effective_date}
                                onChange={(e) => setData('effective_date', e.target.value)}
                            />
                            <InputError message={errors.effective_date} />
                        </div>

                        <div>
                            <Label htmlFor="installation_date">Installation Date</Label>
                            <Input
                                id="installation_date"
                                name="installation_date"
                                type="date"
                                value={data.installation_date}
                                onChange={(e) => setData('installation_date', e.target.value)}
                            />
                            <InputError message={errors.installation_date} />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Enter additional notes"
                            rows={3}
                        />
                        <InputError message={errors.notes} />
                    </div>
                </form>
            </div>

            <div className="bg-background border-t p-6">
                <Button
                    type="submit"
                    size="lg"
                    className="w-full py-4"
                    disabled={processing || (data.action_type === 'initial_assignment' && (!availableMeters || availableMeters.length === 0))}
                    onClick={submit}
                >
                    {processing ? 'Processing...' : `Create ${getActionTypeLabel(data.action_type)} Log`}
                </Button>
            </div>
        </div>
    );
}
