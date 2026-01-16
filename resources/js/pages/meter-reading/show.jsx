import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show({ meterReading }) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Meter Readings', href: route('meter-readings') },
        { title: 'Details', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reading Details`} />
            <div className="mb-6 flex items-center space-x-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={route('meter-readings')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Reading Details
                    </h1>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Reading Information</CardTitle>
                    <CardDescription>
                        Details for reading recorded on{' '}
                        {new Date(
                            meterReading.reading_date,
                        ).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Meter Serial
                            </span>
                            <p className="text-base font-semibold">
                                {meterReading.meter?.meter_number}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Customer
                            </span>
                            <p className="text-base font-semibold">
                                {meterReading.meter?.home?.customer?.name ??
                                    'Unknown'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Address
                            </span>
                            <p className="text-base font-semibold">
                                {meterReading.meter?.home?.address ?? 'Unknown'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Status
                            </span>
                            <div>
                                <Badge variant="outline" className="capitalize">
                                    {meterReading.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Previous Reading
                            </span>
                            <p className="font-mono text-xl">
                                {meterReading.previous_reading}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Current Reading
                            </span>
                            <p className="font-mono text-xl font-bold">
                                {meterReading.current_reading}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">
                                Consumption
                            </span>
                            <p className="font-mono text-xl text-primary">
                                {(
                                    meterReading.current_reading -
                                    meterReading.previous_reading
                                ).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {meterReading.image && (
                        <div className="space-y-2 border-t pt-4">
                            <span className="text-sm font-medium text-muted-foreground">
                                Reading Photo
                            </span>
                            <div className="overflow-hidden rounded-lg border bg-muted">
                                <img
                                    src={meterReading.image_url}
                                    alt="Meter Reading"
                                    className="h-auto max-h-[400px] w-full object-contain"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1 border-t pt-4">
                        <span className="text-sm font-medium text-muted-foreground">
                            Read By
                        </span>
                        <p className="text-sm">
                            {meterReading.reader?.name ?? 'System'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
