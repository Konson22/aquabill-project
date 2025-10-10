import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FileText, MapPin, Save, User } from 'lucide-react';
import { useState } from 'react';

export default function CustomerForm({ customer = null, categories = [], neighborhoods = [], meters = [], isEditing = false, onSuccess }) {
    const [createNewNeighborhood, setCreateNewNeighborhood] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Customer fields
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        contract: customer?.contract || '',
        date: customer?.date ? new Date(customer.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        credit: customer?.credit || '',
        category_id: customer?.category_id || '',
        meter_id: customer?.meter_id || '',
        is_active: customer?.is_active ?? true,

        // Location fields
        plot_number: customer?.plot_number || '',
        address: customer?.address || '',
        latitude: customer?.latitude || '',
        longitude: customer?.longitude || '',

        // Zone fields
        neighborhood_id: customer?.neighborhood_id || '',
        new_neighborhood_name: '',

        // Invoice fields
        invoice_reason: '',
        invoice_issue_date: new Date().toISOString().split('T')[0],
        invoice_due_date: '',
        invoice_amount_due: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate that at least one neighborhood option is provided
        if (!data.neighborhood_id && !data.new_neighborhood_name.trim()) {
            alert('Please either select an existing neighborhood or add a new one.');
            return;
        }

        if (isEditing) {
            put(`/customers/${customer.id}`, {
                onSuccess: () => {
                    reset();
                    setCreateNewNeighborhood(false);
                    if (onSuccess) onSuccess();
                },
            });
        } else {
            post('/customers', {
                onSuccess: () => {
                    reset();
                    setCreateNewNeighborhood(false);
                    if (onSuccess) onSuccess();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Customer Information */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Customer Information
                            </CardTitle>
                            <CardDescription>Enter the customer's personal and account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="Enter first name"
                                        required
                                    />
                                    {errors.first_name && <InputError message={errors.first_name} />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Enter last name"
                                        required
                                    />
                                    {errors.last_name && <InputError message={errors.last_name} />}
                                </div>
                            </div>

                            {/* Contact Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        type="tel"
                                    />
                                    {errors.phone && <InputError message={errors.phone} />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                        type="email"
                                    />
                                    {errors.email && <InputError message={errors.email} />}
                                </div>
                            </div>

                            {/* Account Fields */}
                            <div className="space-y-2">
                                <Label htmlFor="contract">Contract Number (Optional)</Label>
                                <Input
                                    id="contract"
                                    value={data.contract}
                                    onChange={(e) => setData('contract', e.target.value)}
                                    placeholder="Enter contract number"
                                />
                                {errors.contract && <InputError message={errors.contract} />}
                            </div>

                            {/* Additional Fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Contract Date</Label>
                                    <Input id="date" value={data.date} onChange={(e) => setData('date', e.target.value)} type="date" />
                                    {errors.date && <InputError message={errors.date} />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="credit">Credit Balance</Label>
                                    <Input
                                        id="credit"
                                        value={data.credit}
                                        onChange={(e) => setData('credit', e.target.value)}
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                    />
                                    {errors.credit && <InputError message={errors.credit} />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category_id">Category *</Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <InputError message={errors.category_id} />}
                                </div>
                            </div>

                            {/* Meter Assignment */}
                            <div className="space-y-2">
                                <Label htmlFor="meter_id">Meter Assignment (Optional)</Label>
                                <Select value={data.meter_id || 'none'} onValueChange={(value) => setData('meter_id', value === 'none' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select meter (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Meter Assigned</SelectItem>
                                        {meters.map((meter) => (
                                            <SelectItem key={meter.id} value={meter.id.toString()}>
                                                {meter.serial || meter.meter_number} - {meter.model || 'Unknown Model'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.meter_id && <InputError message={errors.meter_id} />}
                            </div>

                            {/* Status */}
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                                <Label htmlFor="is_active">Active Customer</Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Location Information */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                Location Information
                            </CardTitle>
                            <CardDescription>Enter location details for the customer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Location Details */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="plot_number">Plot Number (Optional)</Label>
                                    <Input
                                        id="plot_number"
                                        value={data.plot_number}
                                        onChange={(e) => setData('plot_number', e.target.value)}
                                        placeholder="Enter location number"
                                    />
                                    {errors.plot_number && <InputError message={errors.plot_number} />}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Enter address"
                                    />
                                    {errors.address && <InputError message={errors.address} />}
                                </div>

                                {/* Coordinates */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            value={data.latitude}
                                            onChange={(e) => setData('latitude', e.target.value)}
                                            placeholder="e.g., -1.2921"
                                            type="number"
                                            step="any"
                                        />
                                        {errors.latitude && <InputError message={errors.latitude} />}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            value={data.longitude}
                                            onChange={(e) => setData('longitude', e.target.value)}
                                            placeholder="e.g., 36.8219"
                                            type="number"
                                            step="any"
                                        />
                                        {errors.longitude && <InputError message={errors.longitude} />}
                                    </div>
                                </div>

                                {/* Zone Selection */}
                                <div className="space-y-3">
                                    <Label>Zone *</Label>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Select an existing zone or add a new one</p>

                                    {/* Zone Select */}
                                    <div className="space-y-2">
                                        <Select
                                            value={data.neighborhood_id || 'none'}
                                            onValueChange={(value) => {
                                                setData('neighborhood_id', value === 'none' ? '' : value);
                                                // Clear new zone name when selecting existing
                                                if (value !== 'none') {
                                                    setData('new_neighborhood_name', '');
                                                    setCreateNewNeighborhood(false);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose existing zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Zone Selected</SelectItem>
                                                {neighborhoods.map((neighborhood) => (
                                                    <SelectItem key={neighborhood.id} value={neighborhood.id.toString()}>
                                                        {neighborhood.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.neighborhood_id && <InputError message={errors.neighborhood_id} />}
                                    </div>

                                    {/* Add New Zone Button */}
                                    <div className="flex items-center space-x-2">
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">OR</span>
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCreateNewNeighborhood(!createNewNeighborhood);
                                            // Clear existing zone selection when adding new
                                            if (!createNewNeighborhood) {
                                                setData('neighborhood_id', '');
                                            }
                                        }}
                                        className="w-full"
                                    >
                                        {createNewNeighborhood ? 'Cancel Adding New' : 'Add New Zone'}
                                    </Button>

                                    {/* New Zone Field */}
                                    {createNewNeighborhood && (
                                        <div className="space-y-2">
                                            <Label htmlFor="new_neighborhood_name">New Zone Name *</Label>
                                            <Input
                                                id="new_neighborhood_name"
                                                value={data.new_neighborhood_name}
                                                onChange={(e) => setData('new_neighborhood_name', e.target.value)}
                                                placeholder="Enter new zone name"
                                            />
                                            {errors.new_neighborhood_name && <InputError message={errors.new_neighborhood_name} />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Invoice Information - Only show for new customers */}
            {!isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            Service Invoice (Optional)
                        </CardTitle>
                        <CardDescription>Create an invoice for service payments like meter installation fees</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_reason">Reason for Invoice</Label>
                                <Input
                                    id="invoice_reason"
                                    value={data.invoice_reason}
                                    onChange={(e) => setData('invoice_reason', e.target.value)}
                                    placeholder="e.g., Meter Installation Fee, Service Connection"
                                />
                                {errors.invoice_reason && <InputError message={errors.invoice_reason} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice_amount_due">Amount Due</Label>
                                <Input
                                    id="invoice_amount_due"
                                    value={data.invoice_amount_due}
                                    onChange={(e) => setData('invoice_amount_due', e.target.value)}
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                />
                                {errors.invoice_amount_due && <InputError message={errors.invoice_amount_due} />}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_issue_date">Issue Date</Label>
                                <Input
                                    id="invoice_issue_date"
                                    value={data.invoice_issue_date}
                                    onChange={(e) => setData('invoice_issue_date', e.target.value)}
                                    type="date"
                                />
                                {errors.invoice_issue_date && <InputError message={errors.invoice_issue_date} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice_due_date">Due Date</Label>
                                <Input
                                    id="invoice_due_date"
                                    value={data.invoice_due_date}
                                    onChange={(e) => setData('invoice_due_date', e.target.value)}
                                    type="date"
                                />
                                {errors.invoice_due_date && <InputError message={errors.invoice_due_date} />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
                <Button type="submit" disabled={processing} className="gap-2">
                    <Save className="h-4 w-4" />
                    {processing ? (isEditing ? 'Updating...' : 'Creating...') : isEditing ? 'Update Customer' : 'Create Customer'}
                </Button>
            </div>
        </form>
    );
}
