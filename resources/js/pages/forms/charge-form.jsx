import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';

export default function ChargeForm({ charge = null, categories = [], isEditing = false }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        charge_amount: charge?.charge_amount || '',
        description: charge?.description || '',
        category_id: charge?.category_id || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('charges.update', charge.id), {
                onFinish: () => reset(),
            });
        } else {
            post(route('charges.store'), {
                onFinish: () => reset(),
            });
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit Charge' : 'Add New Charge'}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isEditing ? 'Update the charge information below' : 'Create a new charge with amount and description'}
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Charge Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="charge_amount" className="font-medium text-slate-700">
                            Charge Amount *
                        </Label>
                        <Input
                            id="charge_amount"
                            name="charge_amount"
                            type="number"
                            required
                            step="0.01"
                            min="0"
                            value={data.charge_amount}
                            onChange={(e) => setData('charge_amount', e.target.value)}
                            placeholder="0.00"
                            className="h-12"
                        />
                        <InputError message={errors.charge_amount} />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id" className="font-medium text-slate-700">
                            Category
                        </Label>
                        <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a category (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No Category</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="font-medium text-slate-700">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Enter charge description (optional)"
                        rows={3}
                        className="resize-none"
                    />
                    <InputError message={errors.description} />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 font-medium text-white hover:from-blue-700 hover:to-blue-800"
                >
                    {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Charge' : 'Create Charge'}
                </Button>
            </form>
        </div>
    );
}
