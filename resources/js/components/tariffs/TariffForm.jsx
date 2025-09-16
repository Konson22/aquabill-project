import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calculator, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

export default function TariffForm({ tariff = null, onSave, trigger = 'button', categories = [] }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        effective_date: tariff?.effective_date || new Date().toISOString().split('T')[0],
        unit_price: tariff?.unit_price || '',
        fixed_charge: tariff?.fixed_charge || '',
        description: tariff?.description || '',
        category_id: tariff?.category_id || '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await onSave(formData);
            setOpen(false);
            setFormData({
                effective_date: new Date().toISOString().split('T')[0],
                unit_price: '',
                fixed_charge: '',
                description: '',
                category_id: '',
            });
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    const calculateSampleBill = () => {
        const unitPrice = parseFloat(formData.unit_price) || 0;
        const fixedCharge = parseFloat(formData.fixed_charge) || 0;
        const sampleConsumption = 50; // 50 m³ sample

        return sampleConsumption * unitPrice + fixedCharge;
    };

    const getTriggerButton = () => {
        if (trigger === 'icon') {
            return tariff ? (
                <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            ) : (
                <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                </Button>
            );
        }

        return tariff ? (
            <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Tariff
            </Button>
        ) : (
            <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Tariff
            </Button>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{getTriggerButton()}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{tariff ? 'Edit Tariff' : 'Create New Tariff'}</DialogTitle>
                    <DialogDescription>
                        {tariff ? 'Update the pricing structure' : 'Define a new water pricing structure with rates and charges'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="effective_date">Effective Date</Label>
                        <div className="relative">
                            <Input
                                id="effective_date"
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => handleInputChange('effective_date', e.target.value)}
                                required
                            />
                        </div>
                        {errors.effective_date && <p className="text-sm text-red-600">{errors.effective_date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category</Label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(value) => handleInputChange('category_id', value)}
                            required
                        >
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
                        {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unit_price">Unit Price (per m³)</Label>
                            <div className="relative">
                                <Input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.unit_price}
                                    onChange={(e) => handleInputChange('unit_price', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            {errors.unit_price && <p className="text-sm text-red-600">{errors.unit_price}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fixed_charge">Fixed Charge</Label>
                            <div className="relative">
                                <Input
                                    id="fixed_charge"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.fixed_charge}
                                    onChange={(e) => handleInputChange('fixed_charge', e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            {errors.fixed_charge && <p className="text-sm text-red-600">{errors.fixed_charge}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Brief description of this tariff structure..."
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* Sample Bill Calculation */}
                    {formData.unit_price && formData.fixed_charge && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                            <div className="mb-2 flex items-center space-x-2">
                                <Calculator className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-800 dark:text-blue-200">Sample Bill Calculation</span>
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p>For 50 m³ consumption: ${calculateSampleBill().toFixed(2)}</p>
                                <p className="mt-1 text-xs">
                                    Breakdown: (50 × ${formData.unit_price}) + ${formData.fixed_charge}
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
                                <p>
                                    Ensure this tariff doesn't conflict with existing pricing structures for the same consumption range and effective
                                    date.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : tariff ? 'Update Tariff' : 'Create Tariff'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
