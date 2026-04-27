import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Calendar,
    Droplet,
    MapPin,
    Phone,
    Receipt,
    User,
    Wrench,
    CreditCard,
    Activity,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerBills from './components/customer-bills';
import CustomerReadings from './components/customer-readings';
import CustomerPayments from './components/customer-payments';
import CustomerServiceCharges from './components/customer-service-charges';

export default function Show({ customer }) {
    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        { title: customer?.account_number ?? 'Customer', href: customer ? `/customers/${customer.id}` : '/customers' },
    ];

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return String(value);
        }
    };

    const statusVariant = customer?.status === 'active' ? 'success' : 'secondary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `${customer.name} • ${customer.account_number}` : 'Customer'} />

            <div className="mx-auto w-full max-w-6xl p-6 space-y-6 animate-in fade-in duration-500">
                {/* Top actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Link
                        href="/customers"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Customers
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                            <Wrench className="mr-2 h-4 w-4" />
                            Edit Customer
                        </Button>
                        <Button size="sm" disabled className="bg-blue-600 hover:bg-blue-700">
                            <Droplet className="mr-2 h-4 w-4" />
                            Record Reading
                        </Button>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            {customer?.name ?? 'Customer'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono font-bold text-primary">
                                {customer?.account_number ?? '—'}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="capitalize">{customer?.customer_type ?? '—'}</span>
                            <span className="text-muted-foreground/60">•</span>
                            <Badge variant={statusVariant} className="capitalize text-[10px]">
                                <BadgeCheck className="mr-1.5 h-3 w-3" />
                                {customer?.status ?? 'unknown'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Zone: {customer?.zone?.name ?? '—'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Tariff: {customer?.tariff?.name ?? '—'}
                        </Badge>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium">{customer?.phone ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{customer?.email ?? 'No email'}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium leading-relaxed">{customer?.address ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">
                                National ID: {customer?.national_id ?? '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Connection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium">{formatDate(customer?.connection_date)}</p>
                            <p className="text-xs text-muted-foreground">
                                Created: {formatDate(customer?.created_at)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Data Tabs */}
                <Tabs defaultValue="bills" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30">
                        <TabsTrigger value="bills" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Receipt className="mr-2 h-4 w-4" />
                            Bills
                        </TabsTrigger>
                        <TabsTrigger value="readings" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Droplet className="mr-2 h-4 w-4" />
                            Readings
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Payments
                        </TabsTrigger>
                        <TabsTrigger value="charges" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Wrench className="mr-2 h-4 w-4" />
                            Service Charges
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4">
                        <TabsContent value="bills" className="m-0 border-none p-0 outline-none">
                            <CustomerBills bills={customer?.bills} />
                        </TabsContent>
                        
                        <TabsContent value="readings" className="m-0 border-none p-0 outline-none">
                            <CustomerReadings readings={customer?.readings} />
                        </TabsContent>
                        
                        <TabsContent value="payments" className="m-0 border-none p-0 outline-none">
                            <CustomerPayments payments={customer?.payments} />
                        </TabsContent>
                        
                        <TabsContent value="charges" className="m-0 border-none p-0 outline-none">
                            <CustomerServiceCharges serviceCharges={customer?.serviceCharges} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
