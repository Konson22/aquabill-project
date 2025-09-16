import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

export default function MeterForm({ customers = [], meter = null, isEditing = false, closeDialog }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        serial: meter?.serial || '',
        status: meter?.status || 'active',
        size: meter?.size || '',
        model: meter?.model || '',
        manufactory: meter?.manufactory || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('meters.update', meter.id), {
                data: data,
                onFinish: () => reset(),
            });
        } else {
            post(route('meters.store'), {
                data: data,
                onSuccess: () => {
                    reset();
                    if (closeDialog) {
                        closeDialog();
                    }
                },
                onFinish: () => reset(),
            });
        }
    };

    return (
        <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="serial">Serial Number</Label>
                    <Input
                        id="serial"
                        name="serial"
                        type="text"
                        value={data.serial}
                        onChange={(e) => setData('serial', e.target.value)}
                        placeholder="Enter serial number"
                    />
                    <InputError message={errors.serial} />
                </div>

                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="faulty">Faulty</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="replaced">Replaced</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.status} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="size">Size</Label>
                    <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='1/2"'>1/2"</SelectItem>
                            <SelectItem value='3/4"'>3/4"</SelectItem>
                            <SelectItem value='1"'>1"</SelectItem>
                            <SelectItem value='1.5"'>1.5"</SelectItem>
                            <SelectItem value='2"'>2"</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.size} />
                </div>

                <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                        id="model"
                        name="model"
                        type="text"
                        value={data.model}
                        onChange={(e) => setData('model', e.target.value)}
                        placeholder="Enter meter model"
                    />
                    <InputError message={errors.model} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="manufactory">Manufacturer</Label>
                    <Input
                        id="manufactory"
                        name="manufactory"
                        type="text"
                        value={data.manufactory}
                        onChange={(e) => setData('manufactory', e.target.value)}
                        placeholder="Enter manufacturer"
                    />
                    <InputError message={errors.manufactory} />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
                {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Meter' : 'Create Meter'}
            </Button>
        </form>
    );
}
