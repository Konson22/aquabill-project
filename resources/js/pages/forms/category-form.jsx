import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

export default function CategoryForm({ category = null, isEditing = false, onSuccess }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name || '',
        type_id: category?.type_id || '',
        tariff: category?.tariff || '',
        fixed_charge: category?.fixed_charge || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('categories.update', category.id), {
                onSuccess: () => {
                    reset();
                    if (onSuccess) onSuccess();
                },
                onFinish: () => reset(),
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    reset();
                    if (onSuccess) onSuccess();
                },
                onFinish: () => reset(),
            });
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{isEditing ? 'Edit Category' : 'Add New Category'}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isEditing ? 'Update the category information below' : 'Create a new customer category with pricing information'}
                </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="mb-3">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Residential, Commercial, Industrial"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="mb-3">
                    <Label htmlFor="type_id">Type ID</Label>
                    <Input
                        id="type_id"
                        name="type_id"
                        type="text"
                        required
                        tabIndex={2}
                        autoComplete="type_id"
                        value={data.type_id}
                        onChange={(e) => setData('type_id', e.target.value)}
                        placeholder="e.g., WAT-RES, WAT-COM"
                    />
                    <InputError message={errors.type_id} />
                </div>

                <div className="mb-3 flex gap-4">
                    <div className="flex-1">
                        <Label htmlFor="tariff">Tariff Rate (per unit)</Label>
                        <Input
                            id="tariff"
                            name="tariff"
                            type="number"
                            required
                            tabIndex={4}
                            autoComplete="tariff"
                            value={data.tariff}
                            onChange={(e) => setData('tariff', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                        <InputError message={errors.tariff} />
                    </div>
                    <div className="flex-1">
                        <Label htmlFor="fixed_charge">Fixed Charge (Optional)</Label>
                        <Input
                            id="fixed_charge"
                            name="fixed_charge"
                            type="number"
                            tabIndex={5}
                            autoComplete="fixed_charge"
                            value={data.fixed_charge}
                            onChange={(e) => setData('fixed_charge', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                        <InputError message={errors.fixed_charge} />
                    </div>
                </div>

                <Button disabled={processing} className="mt-4">
                    {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Category' : 'Create Category'}
                </Button>
            </form>
        </div>
    );
}
