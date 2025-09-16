import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Zap } from 'lucide-react';
import MeterForm from '../forms/meter-form';

const breadcrumbs = [
    {
        title: 'Meters',
        href: '/meters',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function MeterEdit({ meter, customers, types }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Meter #${meter.meter_number}`} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            <Zap className="h-8 w-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">Edit Meter #{meter.meter_number}</h1>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">Update meter information and settings</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Link href={`/meters/${meter.id}`}>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Meter
                            </Button>
                        </Link>
                        <Link href="/meters">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Back to Meters
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Meter Information</CardTitle>
                    <CardDescription>Update the meter details and assignment</CardDescription>
                </CardHeader>
                <CardContent>
                    <MeterForm meter={meter} customers={customers} types={types} isEditing={true} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
