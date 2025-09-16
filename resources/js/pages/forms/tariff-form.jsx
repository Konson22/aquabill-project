import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Calculator, Plus } from 'lucide-react';
import { useState } from 'react';

export default function TariffForm({ categories = [], tariff = null, isEditing = false, trigger = null }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        effective_date: tariff?.effective_date || new Date().toISOString().split('T')[0],
        unit_price: tariff?.unit_price || '',
        fixed_charge: tariff?.fixed_charge || '',
        category_id: tariff?.category_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('tariffs.update', tariff.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route('tariffs.store'), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const calculateSampleBill = () => {
        const unitPrice = parseFloat(data.unit_price) || 0;
        const fixedCharge = parseFloat(data.fixed_charge) || 0;
        const sampleConsumption = 50; // 50 m³ sample

        return sampleConsumption * unitPrice + fixedCharge;
    };

    const defaultTrigger = (
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Tariff
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Tariff' : 'Create New Tariff'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the pricing structure' : 'Define a new water pricing structure with rates and charges'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
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
                        <Label htmlFor="category_id">Category *</Label>
                        <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="unit_price">Unit Price (per m³) *</Label>
                            <Input
                                id="unit_price"
                                name="unit_price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={data.unit_price}
                                onChange={(e) => setData('unit_price', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.unit_price} />
                        </div>

                        <div>
                            <Label htmlFor="fixed_charge">Fixed Charge *</Label>
                            <Input
                                id="fixed_charge"
                                name="fixed_charge"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={data.fixed_charge}
                                onChange={(e) => setData('fixed_charge', e.target.value)}
                                placeholder="0.00"
                            />
                            <InputError message={errors.fixed_charge} />
                        </div>
                    </div>

                    {/* Sample Bill Calculation */}
                    {data.unit_price && data.fixed_charge && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                            <div className="mb-2 flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-800 dark:text-blue-200">Sample Bill Calculation</span>
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p>For 50 m³ consumption: ${calculateSampleBill().toFixed(2)}</p>
                                <p className="mt-1 text-xs">
                                    Breakdown: (50 × ${data.unit_price}) + ${data.fixed_charge}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warning for overlapping tariffs */}
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium">Important:</p>
                                <p>Ensure this tariff doesn't conflict with existing pricing structures for the same category and effective date.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Tariff' : 'Create Tariff'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
