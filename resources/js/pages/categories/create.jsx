import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Building2, 
    Calculator, 
    DollarSign, 
    Info, 
    Save, 
    Settings, 
    Tag, 
    TrendingUp 
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Create Category',
        href: '#',
    },
];

export default function CreateCategory() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        tariff: '',
        unit_price: '',
        fixed_charge: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), {
            onFinish: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Category" />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-6">
                    <Link href="/categories">
                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                        </Button>
                    </Link>
                </div>
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                        <Tag className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Create New Category</h1>
                    <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                        Add a new customer category with pricing information
                    </p>
                </div>
            </div>

            {/* Create Form */}
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Basic Info
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Pricing
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Define the basic details for your customer category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-base font-medium">
                                            Category Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Residential, Commercial, Industrial"
                                            className="h-12 text-base"
                                        />
                                        <InputError message={errors.name} />
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Choose a descriptive name that clearly identifies this customer category
                                        </p>
                                    </div>

                                    <div className="flex space-x-4 pt-6">
                                        <Button 
                                            type="button" 
                                            onClick={() => document.querySelector('[value="pricing"]').click()}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            Next: Pricing
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                    Pricing Configuration
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Set up the pricing structure for this category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="tariff" className="text-base font-medium">
                                                Tariff Rate <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                                                    className="h-12 pl-10 text-base"
                                                />
                                            </div>
                                            <InputError message={errors.tariff} />
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                The base tariff rate applied to this category
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="unit_price" className="text-base font-medium">
                                                Unit Price <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <TrendingUp className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                    id="unit_price"
                                                    name="unit_price"
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                    value={data.unit_price}
                                                    onChange={(e) => setData('unit_price', e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-12 pl-10 text-base"
                                                />
                                            </div>
                                            <InputError message={errors.unit_price} />
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Price per unit of water consumption
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fixed_charge" className="text-base font-medium">
                                            Fixed Charge (Optional)
                                        </Label>
                                        <div className="relative">
                                            <Settings className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Optional fixed monthly charge (leave as 0 if not applicable)
                                        </p>
                                    </div>

                                    <div className="flex space-x-4 pt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => document.querySelector('[value="basic"]').click()}
                                            className="flex-1"
                                        >
                                            Back: Basic Info
                                        </Button>
                                        <Button 
                                            type="button" 
                                            onClick={() => document.querySelector('[value="preview"]').click()}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                        >
                                            Next: Preview
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Info className="h-5 w-5 text-purple-600" />
                                    Category Preview
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Review your category details before creating
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Preview Card */}
                                    <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 dark:border-slate-700">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                                                <Tag className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                    {data.name || 'Category Name'}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Customer Category
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4 text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tariff Rate</span>
                                                </div>
                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    SSP {(data.tariff || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="h-4 w-4 text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price</span>
                                                </div>
                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    SSP {(data.unit_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            
                                            {data.fixed_charge > 0 && (
                                                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                                    <div className="flex items-center space-x-2">
                                                        <Settings className="h-4 w-4 text-slate-600" />
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Fixed Charge</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        SSP {(data.fixed_charge || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 pt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            onClick={() => document.querySelector('[value="pricing"]').click()}
                                            className="flex-1"
                                        >
                                            Back: Pricing
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Creating...' : 'Create Category'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

        </AppLayout>
    );
}
