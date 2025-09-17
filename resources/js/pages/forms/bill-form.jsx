import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

export default function BillForm({ customers = [], meters = [], readings = [], tariffs = [], bill = null, isEditing = false }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        customer_id: bill?.customer_id || '',
        meter_id: bill?.meter_id || '',
        reading_id: bill?.reading_id || '',
        tariff_id: bill?.tariff_id || '',
        billing_period_start: bill?.billing_period_start || '',
        billing_period_end: bill?.billing_period_end || '',
        consumption: bill?.consumption || '',
        unit_price: bill?.unit_price || '',
        fixed_charge: bill?.fixed_charge || '0',
        prev_balance: bill?.prev_balance || '0',
        status: bill?.status || 'unpaid',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('bills.update', bill.id), {
                onFinish: () => reset(),
            });
        } else {
            post(route('bills.store'), {
                onFinish: () => reset(),
            });
        }
    };

    return (
        <form className="space-y-4 p-6" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="customer_id">Customer *</Label>
                    <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                    {customer.first_name} {customer.last_name} - {customer.account_number}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.customer_id} />
                </div>

                <div>
                    <Label htmlFor="meter_id">Meter *</Label>
                    <Select value={data.meter_id} onValueChange={(value) => setData('meter_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select meter" />
                        </SelectTrigger>
                        <SelectContent>
                            {meters.map((meter) => (
                                <SelectItem key={meter.id} value={meter.id.toString()}>
                                    {meter.meter_number} - {meter.serial}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.meter_id} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="reading_id">Meter Reading *</Label>
                    <Select value={data.reading_id} onValueChange={(value) => setData('reading_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select meter reading" />
                        </SelectTrigger>
                        <SelectContent>
                            {readings.map((reading) => (
                                <SelectItem key={reading.id} value={reading.id.toString()}>
                                    {reading.meter?.meter_number} - {reading.current_reading} ({reading.reading_date})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.reading_id} />
                </div>

                <div>
                    <Label htmlFor="tariff_id">Tariff *</Label>
                    <Select value={data.tariff_id} onValueChange={(value) => setData('tariff_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select tariff" />
                        </SelectTrigger>
                        <SelectContent>
                            {tariffs.map((tariff) => (
                                <SelectItem key={tariff.id} value={tariff.id.toString()}>
                                    {tariff.category?.name} - ${tariff.unit_price}/unit
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.tariff_id} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="billing_period_start">Billing Period Start *</Label>
                    <Input
                        id="billing_period_start"
                        name="billing_period_start"
                        type="date"
                        required
                        value={data.billing_period_start}
                        onChange={(e) => setData('billing_period_start', e.target.value)}
                    />
                    <InputError message={errors.billing_period_start} />
                </div>

                <div>
                    <Label htmlFor="billing_period_end">Billing Period End *</Label>
                    <Input
                        id="billing_period_end"
                        name="billing_period_end"
                        type="date"
                        required
                        value={data.billing_period_end}
                        onChange={(e) => setData('billing_period_end', e.target.value)}
                    />
                    <InputError message={errors.billing_period_end} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="consumption">Consumption (units) *</Label>
                    <Input
                        id="consumption"
                        name="consumption"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={data.consumption}
                        onChange={(e) => setData('consumption', e.target.value)}
                        placeholder="Enter consumption"
                    />
                    <InputError message={errors.consumption} />
                </div>

                <div>
                    <Label htmlFor="unit_price">Unit Price *</Label>
                    <Input
                        id="unit_price"
                        name="unit_price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={data.unit_price}
                        onChange={(e) => setData('unit_price', e.target.value)}
                        placeholder="Enter unit price"
                    />
                    <InputError message={errors.unit_price} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="fixed_charge">Fixed Charge</Label>
                    <Input
                        id="fixed_charge"
                        name="fixed_charge"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.fixed_charge}
                        onChange={(e) => setData('fixed_charge', e.target.value)}
                        placeholder="Enter fixed charge"
                    />
                    <InputError message={errors.fixed_charge} />
                </div>

                <div>
                    <Label htmlFor="prev_balance">Previous Balance</Label>
                    <Input
                        id="prev_balance"
                        name="prev_balance"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.prev_balance}
                        onChange={(e) => setData('prev_balance', e.target.value)}
                        placeholder="Enter previous balance"
                    />
                    <InputError message={errors.prev_balance} />
                </div>
            </div>

            <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        <SelectItem value="balance_forwarded">Balance Forwarded</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.status} />
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full py-4" disabled={processing}>
                {processing ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Bill' : 'Create Bill')}
            </Button>
        </form>
    );
}
