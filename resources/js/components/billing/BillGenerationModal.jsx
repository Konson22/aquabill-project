import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, Plus } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function BillGenerationModal({ tariffs = [], onGenerate }) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        billing_period_start: '',
        billing_period_end: '',
        category_id: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Submit to the backend using Inertia
            router.post('/billing/generate', formData, {
                onSuccess: () => {
                    setOpen(false);
                    setFormData({
                        billing_period_start: '',
                        billing_period_end: '',
                        category_id: '',
                    });
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error generating bills:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Bills
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Bills</DialogTitle>
                    <DialogDescription>Generate bills for all customers based on meter readings for the specified period.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="billing_period_start">Billing Period Start</Label>
                        <div className="relative">
                            <Calendar className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                            <Input
                                id="billing_period_start"
                                type="date"
                                value={formData.billing_period_start}
                                onChange={(e) => handleInputChange('billing_period_start', e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="billing_period_end">Billing Period End</Label>
                        <div className="relative">
                            <Calendar className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                            <Input
                                id="billing_period_end"
                                type="date"
                                value={formData.billing_period_end}
                                onChange={(e) => handleInputChange('billing_period_end', e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_id">Category/Tariff</Label>
                        <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {tariffs.map((tariff) => (
                                    <SelectItem key={tariff.id} value={tariff.id.toString()}>
                                        {tariff.name} - ${tariff.unit_price}/m³
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium">Important:</p>
                                <p>This will generate bills for all customers with active meters. Make sure meter readings are up to date.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Bills'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
