import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gauge, Home, User } from 'lucide-react';

export default function MeterShow({ meter }) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Meters',
            href: route('meters'),
        },
        {
            title: meter.meter_number,
            href: '#',
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Not Installed';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Meter ${meter.meter_number}`} />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('meters')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Meter Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Viewing information for meter {meter.meter_number}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Meter Info Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                Meter Information
                            </CardTitle>
                            <Gauge className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-1">
                                <Label className="text-muted-foreground">
                                    Serial Number
                                </Label>
                                <div className="text-lg font-semibold">
                                    {meter.meter_number}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">
                                        Type
                                    </Label>
                                    <div>{meter.meter_type}</div>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-muted-foreground">
                                        Status
                                    </Label>
                                    <div>
                                        <Badge
                                            variant={
                                                meter.status === 'active'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {meter.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Label className="text-muted-foreground">
                                Installation Date
                            </Label>
                            <div>
                                {formatDate(meter.home?.meter_install_date)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Linked Entity Card (Home/Customer) */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                Location & Customer
                            </CardTitle>
                            <Home className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            {meter.home ? (
                                <>
                                    <div className="grid gap-1">
                                        <Label className="text-muted-foreground">
                                            Address
                                        </Label>
                                        <div className="font-medium">
                                            {meter.home.address}
                                        </div>
                                    </div>
                                    <Separator />
                                    {meter.home.customer ? (
                                        <div className="grid gap-1">
                                            <Label className="flex items-center gap-2 text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                Customer
                                            </Label>
                                            <div className="font-medium">
                                                {meter.home.customer.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {meter.home.customer.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {meter.home.customer.phone}
                                            </div>
                                            <div className="mt-2">
                                                <Button
                                                    variant="link"
                                                    className="h-auto px-0"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'customers.show',
                                                            meter.home.customer
                                                                .id,
                                                        )}
                                                    >
                                                        View Customer Profile
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <User className="mb-2 h-8 w-8 text-muted-foreground/30" />
                                            <p className="text-muted-foreground">
                                                No customer linked to this home.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Home className="mb-3 h-10 w-10 text-muted-foreground/30" />
                                    <p className="text-muted-foreground">
                                        This meter is not currently assigned to
                                        any home.
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        Assign to Home
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
