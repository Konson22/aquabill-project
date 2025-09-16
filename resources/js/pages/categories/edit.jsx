import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, DollarSign, Edit, Save, Settings } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Edit Category',
        href: '#',
    },
];

export default function EditCategory({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        tariff: category.tariff || '',
        unit_price: category.unit_price || '',
        fixed_charge: category.fixed_charge || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('categories.update', category.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />

            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex items-center space-x-2">
                    <Link href="/categories">
                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                        <Edit className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Edit Category: {category.name}</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Update category information and pricing</p>
                </div>
            </div>

            {/* Edit Form */}
            <div className="mx-auto max-w-4xl">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Edit className="h-5 w-5 text-orange-600" />
                            Edit Category Information
                        </CardTitle>
                        <CardDescription className="text-base">Update the category details and pricing information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">
                                        Category Name <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Residential, Commercial, Industrial"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tariff" className="text-base font-medium">
                                        Tariff Rate <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="tariff"
                                            name="tariff"
                                            type="number"
                                            required
                                            step="0.01"
                                            min="0"
                                            value={data.tariff}
                                            onChange={(e) => setData('tariff', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <InputError message={errors.tariff} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fixed_charge" className="text-base font-medium">
                                        Fixed Charge (Optional)
                                    </Label>
                                    <div className="relative">
                                        <Settings className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="fixed_charge"
                                            name="fixed_charge"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.fixed_charge}
                                            onChange={(e) => setData('fixed_charge', e.target.value)}
                                            placeholder="0.00"
                                            className="h-12 pl-10 text-base"
                                        />
                                    </div>
                                    <InputError message={errors.fixed_charge} />
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-6">
                                <Link href="/categories" className="flex-1">
                                    <Button variant="outline" type="button" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update Category'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
