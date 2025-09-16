import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '../forms/customer-form';

const breadcrumbs = [
    {
        title: 'Customers',
        href: '/customers',
    },
    {
        title: 'Edit Customer',
        href: '#',
    },
];

export default function CustomerEdit({ customer, categories, neighborhoods, meters }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer - ${customer.first_name} ${customer.last_name}`} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Customer</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Update customer information and settings</p>
                </div>
                <Link href={`/customers/${customer.id}`}>
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Customer
                    </Button>
                </Link>
            </div>

            <CustomerForm
                customer={customer}
                categories={categories}
                neighborhoods={neighborhoods}
                meters={meters}
                isEditing={true}
                onSuccess={() => {
                    // Redirect to customer show page after successful update
                    window.location.href = `/customers/${customer.id}`;
                }}
            />
        </AppLayout>
    );
}
