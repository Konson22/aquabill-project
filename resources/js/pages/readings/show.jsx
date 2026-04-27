import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronLeft, 
    Printer,
    MapPin,
    ArrowUpRight,
    Camera,
    Info,
    CreditCard,
    Droplets
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

    console.log("image", reading.image_url);

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Reading Image */}
                    <div className="md:col-span-1">
                        <div className="bg-card rounded-xl border shadow-sm overflow-hidden aspect-[4/3] flex items-center justify-center bg-muted/30">
                            {reading.image_url ? (
                                <img src={reading.image_url} alt="Reading proof" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                    <Camera className="h-10 w-10" />
                                    <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Details Table */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b bg-muted/20">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                    Reading Details
                                </h3>
                            </div>
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">Previous Reading</td>
                                        <td className="px-6 py-4 font-mono text-right">{reading.previous_reading} m³</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">Current Reading</td>
                                        <td className="px-6 py-4 font-mono text-right font-bold">{reading.current_reading} m³</td>
                                    </tr>
                                    <tr className="bg-primary/5">
                                        <td className="px-6 py-4 text-primary font-bold">Total Consumption</td>
                                        <td className="px-6 py-4 text-primary font-black text-right text-lg">{reading.consumption} m³</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">Reading Date</td>
                                        <td className="px-6 py-4 text-right">{formatDate(reading.reading_date)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">Recorded By</td>
                                        <td className="px-6 py-4 text-right">{reading.recorder?.name || 'System'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Bill Card */}
                        {reading.bill && (
                            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-emerald-500" />
                                        Billing Summary
                                    </h3>
                                    <Badge variant={reading.bill.status === 'paid' ? 'success' : 'destructive'} className="capitalize">
                                        {reading.bill.status}
                                    </Badge>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Usage Charge</p>
                                            <p className="font-mono font-bold italic">SSP {reading.bill.current_charge}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Fixed Charge</p>
                                            <p className="font-mono font-bold italic">SSP {reading.bill.fixed_charge}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Arrears</p>
                                            <p className="font-mono font-bold italic text-red-500">SSP {reading.bill.previous_balance}</p>
                                        </div>
                                        <div className="bg-primary/5 p-2 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-primary mb-1">Total Due</p>
                                            <p className="text-xl font-black text-primary italic">SSP {reading.bill.total_amount}</p>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full mt-6" variant="outline">
                                        <Link href={`/bills/${reading.bill.id}`}>
                                            View Full Bill Details
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {reading.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold text-amber-800 uppercase text-[10px] tracking-widest mb-1">Notes</p>
                                    <p className="text-amber-900 leading-relaxed italic">{reading.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
