import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, MapPin, Save, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
    {
        title: 'Create Customer',
        href: '/customers/create',
    },
];

export default function CreateCustomer({ areas, meters, categories, neighborhoods, errors = {} }) {
    const [createNewNeighborhood, setCreateNewNeighborhood] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        // Customer fields
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        contract: '',
        date: new Date().toISOString().split('T')[0],
        credit: '',
        category_id: '',
        meter_id: '',
        is_active: true,

        // Location fields
        plot_number: '',
        address: '',
        latitude: '',
        longitude: '',

        // Neighborhood fields
        neighborhood_id: '',
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

        post('/customers', {
            onSuccess: () => {
                reset();
                setCreateNewNeighborhood(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Customer" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Customer</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Add a new customer to the system</p>
                </div>
                <Link href="/customers">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Customers
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                                    <Label htmlFor="contract">Contract Number</Label>
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
                                    <Select
                                        value={data.meter_id || 'none'}
                                        onValueChange={(value) => setData('meter_id', value === 'none' ? '' : value)}
                                    >
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
                                        <Label htmlFor="plot_number">Plot Number</Label>
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

                                    {/* Neighborhood Selection */}
                                    <div className="space-y-3">
                                        <Label>Neighborhood *</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Select an existing neighborhood or add a new one</p>

                                        {/* Neighborhood Select */}
                                        <div className="space-y-2">
                                            <Select
                                                value={data.neighborhood_id || 'none'}
                                                onValueChange={(value) => {
                                                    setData('neighborhood_id', value === 'none' ? '' : value);
                                                    // Clear new neighborhood name when selecting existing
                                                    if (value !== 'none') {
                                                        setData('new_neighborhood_name', '');
                                                        setCreateNewNeighborhood(false);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose existing neighborhood" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Neighborhood Selected</SelectItem>
                                                    {neighborhoods.map((neighborhood) => (
                                                        <SelectItem key={neighborhood.id} value={neighborhood.id.toString()}>
                                                            {neighborhood.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.neighborhood_id && <InputError message={errors.neighborhood_id} />}
                                        </div>

                                        {/* Add New Neighborhood Button */}
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
                                                // Clear existing neighborhood selection when adding new
                                                if (!createNewNeighborhood) {
                                                    setData('neighborhood_id', '');
                                                }
                                            }}
                                            className="w-full"
                                        >
                                            {createNewNeighborhood ? 'Cancel Adding New' : 'Add New Neighborhood'}
                                        </Button>

                                        {/* New Neighborhood Field */}
                                        {createNewNeighborhood && (
                                            <div className="space-y-2">
                                                <Label htmlFor="new_neighborhood_name">New Neighborhood Name *</Label>
                                                <Input
                                                    id="new_neighborhood_name"
                                                    value={data.new_neighborhood_name}
                                                    onChange={(e) => setData('new_neighborhood_name', e.target.value)}
                                                    placeholder="Enter new neighborhood name"
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

                {/* Invoice Information */}
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

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                    <Link href="/customers">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="gap-2">
                        <Save className="h-4 w-4" />
                        {processing ? 'Creating...' : 'Create Customer'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
