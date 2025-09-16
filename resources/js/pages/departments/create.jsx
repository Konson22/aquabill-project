import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';

const breadcrumbs = [
    { title: 'Departments', href: '/departments' },
    { title: 'Create', href: '/departments/create' },
];

export default function CreateDepartment() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/departments');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Department" />

            <div className="max-w-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center space-x-4">
                    <Link href="/departments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create Department</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">Add a new department to the organization</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="mr-2 h-5 w-5" />
                            Department Information
                        </CardTitle>
                        <CardDescription>Enter the details for the new department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter department name"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href="/departments">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Department'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
