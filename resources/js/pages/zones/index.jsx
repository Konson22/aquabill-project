import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Plus,
    Users,
    Clock,
    MoreHorizontal,
    Edit2,
    CalendarDays
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Zones',
        href: '/zones',
    },
];

export default function Zones({ zones }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Zones" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-red-500" />
                            Billing Zones
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage geographic billing areas, water supply schedules, and customer density.
                        </p>
                    </div>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        New Zone
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {zones.map((zone) => (
                        <div key={zone.id} className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">{zone.name}</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Customers</span>
                                        <div className="flex items-center gap-2 text-foreground font-semibold">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {zone.customers_count}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Supply Day</span>
                                        <div className="flex items-center gap-2 text-foreground font-semibold">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {zone.supply_day || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground italic">
                                        Supply Time: {zone.supply_time || 'Not set'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-muted/30 px-6 py-3 flex justify-between items-center">
                                <Badge variant={zone.status === 'active' ? 'success' : 'secondary'}>
                                    {zone.status.toUpperCase()}
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                    <Edit2 className="h-3 w-3" />
                                    Configure
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
