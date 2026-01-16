import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CustomerEdit({ customer }) {
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('customers.update', customer.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Customers', href: route('customers.index') },
                { title: 'Edit', href: route('customers.edit', customer.id) },
            ]}
        >
            <Head title="Edit Customer" />

            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Customer
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update customer details.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex h-full flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="John Doe"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="+211 9..."
                                        />
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild type="button">
                            <Link href={route('customers.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Customer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
