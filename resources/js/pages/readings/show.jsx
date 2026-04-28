import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    ChevronLeft, 
    Printer,
    MapPin,
    ArrowUpRight,
    Camera,
    Info,
    CreditCard,
    Droplets,
    User,
    Phone,
    Calendar
} from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
    }).format(new Date(dateString));
};

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(dateString));
};

export default function Show({ reading }) {
    const breadcrumbs = [
        { title: 'Meter Readings', href: '/readings' },
        { title: `Reading #${reading.id}`, href: `/readings/${reading.id}` },
    ];


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reading - ${reading.meter.meter_number}`} />

            <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/readings">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{reading.meter.customer.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{reading.meter.customer.zone.name}</span>
                                <span>•</span>
                                <span className="font-mono">{reading.meter.meter_number}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {reading.bill && (
                            <Button variant="outline" asChild size="sm">
                                <Link href={`/bills/${reading.bill.id}/print`} target="_blank">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Bill
                                </Link>
                            </Button>
                        )}
                        <Button variant="default" size="sm" asChild>
                            <Link href={`/customers/${reading.meter.customer_id}`}>
                                View Customer
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-border shadow-sm overflow-hidden flex flex-col divide-y">
                    {/* Top Section: Data & Details */}
                    <div className="p-6 md:p-8 space-y-8 bg-card">
                        
                        {/* Customer Details Section */}
                        <section>
                            <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 flex items-center gap-2">
                                <User className="h-4 w-4" /> Customer Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Customer Name</p>
                                    <p className="font-medium text-foreground">{reading.meter.customer.name}</p>
                                </div>
                                {reading.meter.customer.phone && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Phone Number</p>
                                        <p className="font-medium flex items-center gap-1.5 text-foreground">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {reading.meter.customer.phone}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Location / Zone</p>
                                    <p className="font-medium flex items-center gap-1.5 text-foreground">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {reading.meter.customer.zone?.name || 'Unassigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Meter Number</p>
                                    <p className="font-mono bg-muted/50 px-2 py-0.5 rounded text-sm text-foreground inline-flex">
                                        {reading.meter.meter_number}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <Separator />

                        {/* Reading Details Section */}
                        <section>
                            <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-4 flex items-center gap-2">
                                <Droplets className="h-4 w-4" /> Reading Data
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="bg-muted/20 p-4 rounded-xl border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Previous</p>
                                    <p className="font-mono text-lg">{reading.previous_reading} <span className="text-xs text-muted-foreground">m³</span></p>
                                </div>
                                <div className="bg-muted/20 p-4 rounded-xl border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Current</p>
                                    <p className="font-mono text-lg font-bold">{reading.current_reading} <span className="text-xs text-muted-foreground">m³</span></p>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                    <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-1">Consumption</p>
                                    <p className="font-mono text-2xl font-black text-primary">{reading.consumption} <span className="text-sm font-medium">m³</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Reading Date</p>
                                    <p className="font-medium text-sm text-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {formatDate(reading.reading_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Recorded By</p>
                                    <p className="font-medium text-sm text-foreground">
                                        {reading.recorder?.name || 'System'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {reading.bill && (
                            <>
                                <Separator />
                                {/* Billing Summary Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-emerald-500 tracking-widest uppercase flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Billing Summary
                                        </h3>
                                        <Badge variant={reading.bill.status === 'paid' ? 'success' : 'destructive'} className="capitalize">
                                            {reading.bill.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Usage Charge</p>
                                            <p className="font-mono text-sm font-bold">SSP {reading.bill.current_charge}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Fixed Charge</p>
                                            <p className="font-mono text-sm font-bold">SSP {reading.bill.fixed_charge}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Arrears</p>
                                            <p className="font-mono text-sm font-bold text-red-500">SSP {reading.bill.previous_balance}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-1">Total Due</p>
                                            <p className="font-mono text-base font-black text-primary">SSP {reading.bill.total_amount}</p>
                                        </div>
                                    </div>

                                    <Button asChild variant="outline" size="sm" className="w-full">
                                        <Link href={`/bills/${reading.bill.id}`}>
                                            View Full Bill Details
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </section>
                            </>
                        )}

                        {/* Notes Section */}
                        {reading.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 mt-6">
                                <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-amber-800 uppercase text-[10px] tracking-widest mb-1">Notes</p>
                                    <p className="text-amber-900 leading-relaxed italic">{reading.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Image */}
                    <div className="bg-muted/10 p-6 md:p-8 flex flex-col">
                        <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4 flex items-center gap-2">
                            <Camera className="h-4 w-4" /> Reading Proof
                        </h3>
                        <div className="w-full flex-1 rounded-xl overflow-hidden border shadow-sm bg-background flex items-center justify-center min-h-[400px]">
                            {reading.image_url ? (
                                <img src={reading.image_url} alt="Reading proof" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-muted-foreground/40 p-8 text-center">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                        <Camera className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">No Image Provided</p>
                                        <p className="text-xs mt-1">A photo of the meter reading was not uploaded.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
